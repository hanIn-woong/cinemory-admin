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

export type AdminAuditLog = Schemas['AdminAuditLogResponse']
export type AuditAction = NonNullable<AdminAuditLog['action']>
export type AuditTargetType = NonNullable<AdminAuditLog['targetType']>

// 동작 한글 라벨 — 백엔드 AdminAction enum과 같은 키(admin-spec 11-2). 키가 늘면 여기도 늘린다.
export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  USER_LIST_VIEW: '회원 목록 조회',
  USER_DETAIL_VIEW: '회원 상세 조회',
  MOVIE_RESYNC: '영화 재동기화',
  MOVIE_RESYNC_BATCH: '영화 일괄 재동기화',
  MOVIE_SEED_BOX_OFFICE: '영화 시드(박스오피스)',
  MOVIE_SEED_DISCOVER: '영화 시드(discover)',
  GENRE_SEED: '장르 시드',
  COUNTRY_SEED: '국가 시드',
  BOX_OFFICE_SYNC: '박스오피스 수집',
  BOX_OFFICE_REMATCH: '박스오피스 재매칭',
  PERSON_NAME_KO_UPDATE: '인물 한글명 수정',
}

export type AdminPersonSummary = Schemas['AdminPersonSummaryResponse']
export type AdminMovieCredits = Schemas['AdminMovieCreditsResponse']
export type AdminCreditItem = Schemas['AdminCreditItem']
