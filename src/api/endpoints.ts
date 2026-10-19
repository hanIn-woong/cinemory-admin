// 경로 문자열은 여기만 둔다.
export const endpoints = {
  login: '/api/auth/login',
  reissue: '/api/auth/reissue',
  logout: '/api/auth/logout',
  adminMe: '/api/admin/me',
  adminUsers: '/api/admin/users',
  adminUser: (id: string | number) => `/api/admin/users/${id}`,
  adminMovies: '/api/admin/movies',
  adminAuditLogs: '/api/admin/audit-logs',
  adminMovie: (id: string | number) => `/api/admin/movies/${id}`,
  adminMovieResync: (id: string | number) => `/api/admin/movies/${id}/resync`,
} as const
