import type { BaseRecord, CrudFilter, DataProvider } from '@refinedev/core'
import { api } from '../api/client'
import { endpoints } from '../api/endpoints'

interface PageBody {
  content?: BaseRecord[]
  totalElements?: number
}

const LIST_PATHS: Record<string, string> = {
  users: endpoints.adminUsers,
  movies: endpoints.adminMovies,
  'audit-logs': endpoints.adminAuditLogs,
  persons: endpoints.adminPersons,
  'box-office': endpoints.adminBoxOfficeUnlinked,
  theaters: endpoints.adminTheaters,
}

const DETAIL_PATHS: Record<string, (id: string | number) => string> = {
  users: endpoints.adminUser,
  movies: endpoints.adminMovie,
}

// 필터는 평평한 {field, operator: 'eq', value}만 쓴다 — 검색(q)·TMDB ID·정렬(sort enum)·감사 로그 조건(동작·대상·관리자·기간).
function filterValue(filters: CrudFilter[] | undefined, field: string): string | undefined {
  const found = filters?.find((f) => 'field' in f && f.field === field)
  const value = found && 'value' in found ? found.value : undefined
  return value === undefined || value === null || value === '' ? undefined : String(value)
}

function unsupported(): never {
  throw new Error('지원하지 않는 동작입니다.')
}

export const dataProvider: DataProvider = {
  getApiUrl: () => '',

  getList: async ({ resource, pagination, filters }) => {
    const path = LIST_PATHS[resource]
    if (!path) throw new Error(`알 수 없는 리소스: ${resource}`)

    const params = new URLSearchParams()
    // Refine의 페이지 번호는 1-based, 백엔드는 0-based
    params.set('page', String((pagination?.currentPage ?? 1) - 1))
    params.set('size', String(pagination?.pageSize ?? 20))
    for (const field of ['q', 'query', 'tmdbId', 'sort', 'action', 'targetType', 'targetId', 'adminUserId', 'from', 'to', 'missingKorean',
      'chain', 'hasBookingUrl', 'closed', 'nameOverridden']) {
      const value = filterValue(filters, field)
      if (value !== undefined) params.set(field, value)
    }

    const body = await api.get<PageBody>(`${path}?${params.toString()}`)
    return { data: (body.content ?? []) as never[], total: body.totalElements ?? 0 }
  },

  getOne: async ({ resource, id }) => {
    const detailPath = DETAIL_PATHS[resource]
    if (!detailPath) throw new Error(`알 수 없는 리소스: ${resource}`)
    return { data: (await api.get<BaseRecord>(detailPath(id))) as never }
  },

  // 쓰기는 모두 custom으로 — 재동기화·박스오피스 연결(POST), 한글명·극장 수정(PATCH), 포스터 고정(PUT)·해제(DELETE). 갱신된 값을 돌려준다.
  // GET은 화면별 단건 조회(출연진 등)에 쓴다.
  custom: async ({ url, method, payload }) => {
    if (method === 'get') return { data: (await api.get<BaseRecord>(url)) as never }
    if (method === 'post') return { data: (await api.post<BaseRecord>(url, payload)) as never }
    if (method === 'patch') return { data: (await api.patch<BaseRecord>(url, payload)) as never }
    if (method === 'put') return { data: (await api.put<BaseRecord>(url, payload)) as never }
    if (method === 'delete') return { data: (await api.delete<BaseRecord>(url)) as never }
    return unsupported()
  },

  create: async () => unsupported(),
  update: async () => unsupported(),
  deleteOne: async () => unsupported(),
}
