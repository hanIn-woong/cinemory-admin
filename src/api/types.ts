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
  MOVIE_TITLE_KO_UPDATE: '영화 한글 제목 수정',
  THEATER_SEED: '극장 동기화',
  THEATER_BOOKING_URL_UPDATE: '극장 예매 링크 수정',
  THEATER_NAME_UPDATE: '극장 이름 수정',
  BOX_OFFICE_LINK: '박스오피스 연결',
  BOX_OFFICE_UNLINK: '박스오피스 연결 해제',
  MOVIE_POSTER_PIN: '영화 포스터 고정',
  MOVIE_POSTER_UNPIN: '영화 포스터 고정 해제',
  EMBEDDING_SYNC: '임베딩 동기화',
  RECOMMENDATION_DEBUG_VIEW: '추천 디버그 조회',
  MOVIE_RECOMMEND_OVERRIDE: '영화 추천 노출 수동 설정',
}

export type AdminPersonSummary = Schemas['AdminPersonSummaryResponse']
export type AdminMovieCredits = Schemas['AdminMovieCreditsResponse']
export type AdminCreditItem = Schemas['AdminCreditItem']

export type AdminDashboard = Schemas['AdminDashboardResponse']
export type AdminDashboardTopMovie = Schemas['TopMovie']

export type AdminUnlinkedBoxOffice = Schemas['AdminUnlinkedBoxOfficeResponse']
export type BoxOfficeLinkResult = Schemas['BoxOfficeLinkResponse']
export type AdminMoviePosters = Schemas['AdminMoviePostersResponse']
export type AdminPosterCandidate = Schemas['Candidate']
export type AdminPosterUnpinResult = Schemas['AdminMoviePosterUnpinResponse']
export type AdminTheater = Schemas['AdminTheaterResponse']
export type TheaterSeedReport = Schemas['TheaterSeedReport']
export type MovieSearchSuggestion = Schemas['MovieSearchSuggestionResponse']

export const THEATER_CHAINS = ['CGV', '롯데시네마', '메가박스', '씨네Q', '기타'] as const
