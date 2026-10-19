import type { AuthProvider } from '@refinedev/core'
import { ApiError, api, request } from '../api/client'
import { endpoints } from '../api/endpoints'
import { tokenStore } from '../api/tokenStore'
import type { AdminMe, TokenResponse } from '../api/types'

async function serverLogout(): Promise<void> {
  const refreshToken = tokenStore.getRefresh()
  try {
    if (refreshToken) {
      await request('POST', endpoints.logout, { body: { refreshToken }, skipRefresh: true })
    }
  } catch {
    // 서버 폐기에 실패해도 로컬 토큰은 지운다
  } finally {
    tokenStore.clear()
  }
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const tokens = await request<TokenResponse>('POST', endpoints.login, {
        body: { email, password },
        skipRefresh: true,
      })
      tokenStore.set({ accessToken: tokens.accessToken ?? '', refreshToken: tokens.refreshToken ?? '' })
      await api.get<AdminMe>(endpoints.adminMe)
      return { success: true, redirectTo: '/' }
    } catch (e) {
      const error = e as ApiError
      if (error.status === 403) {
        // 일반 계정 — 리프레시 토큰을 남기지 않는다
        await serverLogout()
        return { success: false, error: { name: '로그인 실패', message: '관리자 권한이 없는 계정입니다.' } }
      }
      tokenStore.clear()
      return { success: false, error: { name: '로그인 실패', message: error.message } }
    }
  },

  logout: async () => {
    await serverLogout()
    return { success: true, redirectTo: '/login' }
  },

  // 새로고침 직후는 Access가 없고 Refresh만 있다 — 첫 API 호출이 client.ts에서 재발급한다.
  check: async () =>
    tokenStore.hasSession() ? { authenticated: true } : { authenticated: false, redirectTo: '/login', logout: true },

  getIdentity: async () => {
    const me = await api.get<AdminMe>(endpoints.adminMe)
    return { id: me.userId, name: me.nickname, email: me.email }
  },

  // 401은 client.ts가 재발급을 시도한 뒤에도 여기 왔다면 세션이 끝난 것, 403은 권한이 없는 것 — 둘 다 로그아웃.
  onError: async (error) => {
    const status = (error as ApiError)?.status
    if (status === 401 || status === 403) {
      tokenStore.clear()
      return { logout: true, redirectTo: '/login', error }
    }
    return { error }
  },
}
