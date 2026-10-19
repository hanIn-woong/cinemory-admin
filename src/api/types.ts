import type { components } from './api.d.ts'

// 화면이 쓰는 스키마 별칭. 필드는 생성물 그대로(springdoc은 전부 optional로 낸다) — 화면에서 ?? 로 받는다.
type Schemas = components['schemas']

export type AdminUserSummary = Schemas['AdminUserSummaryResponse']
export type AdminUserDetail = Schemas['AdminUserDetailResponse']
export type AdminMovieSummary = Schemas['AdminMovieSummaryResponse']
export type AdminMovieDetail = Schemas['AdminMovieDetailResponse']
export type AdminMe = Schemas['AdminMeResponse']
export type TokenResponse = Schemas['TokenResponse']

export const USER_SORTS = [
  { value: 'CREATED_AT_DESC', label: '가입 최신순' },
  { value: 'CREATED_AT_ASC', label: '가입 오래된순' },
  { value: 'NICKNAME_ASC', label: '닉네임순' },
] as const

export const MOVIE_SORTS = [
  { value: 'ID_DESC', label: '최근 등록순' },
  { value: 'RELEASE_DATE_DESC', label: '개봉일 최신순' },
  { value: 'SYNCED_AT_ASC', label: '오래 동기화 안 된 순' },
] as const
