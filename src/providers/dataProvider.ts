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
}

const DETAIL_PATHS: Record<string, (id: string | number) => string> = {
  users: endpoints.adminUser,
  movies: endpoints.adminMovie,
}

// 필터는 평평한 {field, operator: 'eq', value}만 쓴다 — 검색(q)·TMDB ID·정렬(sort enum).
function filterValue(filters: CrudFilter[] | undefined, field: string): string | undefined {
  const found = filters?.find((f) => 'field' in f && f.field === field)
  const value = found && 'value' in found ? found.value : undefined
  return value === undefined || value === null || value === '' ? undefined : String(value)
}

function unsupported(): never {
  throw new Error('관리자 1단계는 조회와 단건 재동기화만 지원합니다.')
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
    for (const field of ['q', 'tmdbId', 'sort']) {
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

  // 재동기화 — POST /api/admin/movies/{id}/resync (갱신된 상세를 돌려준다)
  custom: async ({ url, method, payload }) => {
    if (method !== 'post') return unsupported()
    return { data: (await api.post<BaseRecord>(url, payload)) as never }
  },

  create: async () => unsupported(),
  update: async () => unsupported(),
  deleteOne: async () => unsupported(),
}
