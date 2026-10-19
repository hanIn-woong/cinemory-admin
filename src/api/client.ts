import { endpoints } from './endpoints'
import { tokenStore } from './tokenStore'

// 백엔드 ErrorResponse { status, code, message, errors } — 화면은 message를 보여 주고 분기는 code로 한다.
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: { field: string; reason: string }[]

  constructor(status: number, code: string, message: string, fieldErrors: { field: string; reason: string }[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
}

interface RequestOptions {
  body?: unknown
  /** true면 401을 받아도 재발급·재시도하지 않는다 — login·reissue·logout은 무한 루프·토큰 회전 꼬임의 원인이 된다. */
  skipRefresh?: boolean
}

const REQUEST_TIMEOUT_MS = 15_000

async function parseError(response: Response): Promise<ApiError> {
  let body: { code?: string; message?: string; errors?: { field: string; reason: string }[] } = {}
  try {
    body = await response.json()
  } catch {
    // 본문이 JSON이 아니다(프록시 오류 등)
  }
  return new ApiError(
    response.status,
    body.code ?? `HTTP_${response.status}`,
    body.message ?? `요청에 실패했습니다. (${response.status})`,
    body.errors ?? [],
  )
}

async function send(method: string, path: string, body: unknown, accessToken: string | null): Promise<Response> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  try {
    return await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.')
  }
}

// ★ 단일 비행(single-flight) 재발급 — 백엔드는 리프레시 회전 + 재사용 감지를 한다. 동시 401이 각자 reissue를 부르면
// 두 번째가 "이미 쓴 토큰"으로 판정돼 이 사용자의 전 세션이 폐기된다. 진행 중인 Promise를 하나만 두고 모두 그것을 기다린다.
let refreshPromise: Promise<void> | null = null

function refreshOnce(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = tokenStore.getRefresh()
      if (!refreshToken) throw new ApiError(401, 'NO_REFRESH_TOKEN', '로그인이 필요합니다.')
      const response = await send('POST', endpoints.reissue, { refreshToken }, null)
      if (!response.ok) {
        const error = await parseError(response)
        // 4xx = 세션이 죽었다 → 토큰 삭제. 5xx·네트워크 = 일시적 실패 → 토큰은 남긴다.
        if (response.status >= 400 && response.status < 500) tokenStore.clear()
        throw error
      }
      tokenStore.set((await response.json()) as TokenResponse)
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipRefresh = false } = options

  // 새로고침 직후 — Access는 메모리라 비어 있고 Refresh만 남아 있다. 401을 한 번 맞고 돌아오는 대신 먼저 재발급한다.
  if (!skipRefresh && !tokenStore.getAccess() && tokenStore.getRefresh()) {
    await refreshOnce()
  }

  let response = await send(method, path, body, tokenStore.getAccess())

  if (response.status === 401 && !skipRefresh) {
    await refreshOnce() // 실패하면 여기서 던지고, Refine이 onError(401)로 로그인 화면으로 보낸다
    response = await send(method, path, body, tokenStore.getAccess())
  }

  if (!response.ok) throw await parseError(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
}
