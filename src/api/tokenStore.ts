// 토큰 보관(admin-spec AD-7) — Access는 메모리, Refresh는 sessionStorage(탭을 닫으면 끝, 새로고침은 버틴다).
const REFRESH_KEY = 'cinemory-admin.refreshToken'

let accessToken: string | null = null

function readRefresh(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export const tokenStore = {
  getAccess: () => accessToken,
  getRefresh: readRefresh,
  hasSession: () => accessToken !== null || readRefresh() !== null,
  set(tokens: { accessToken: string; refreshToken: string }) {
    accessToken = tokens.accessToken
    try {
      sessionStorage.setItem(REFRESH_KEY, tokens.refreshToken)
    } catch {
      // sessionStorage를 못 쓰는 환경 — 새로고침하면 다시 로그인하면 된다
    }
  },
  clear() {
    accessToken = null
    try {
      sessionStorage.removeItem(REFRESH_KEY)
    } catch {
      // 무시
    }
  },
}
