import { Authenticated, Refine } from '@refinedev/core'
import { ErrorComponent, ThemedLayout, useNotificationProvider } from '@refinedev/antd'
import routerProvider, { CatchAllNavigate, NavigateToResource, DocumentTitleHandler } from '@refinedev/react-router'
import '@refinedev/antd/dist/reset.css'
import { App as AntdApp, ConfigProvider } from 'antd'
import koKR from 'antd/locale/ko_KR'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { antdTheme } from './theme/brand'
import { BrandTitle } from './components/BrandTitle'
import { authProvider } from './providers/authProvider'
import { dataProvider } from './providers/dataProvider'
import { i18nProvider } from './providers/i18nProvider'
import { LoginPage } from './pages/login'
import { UserList } from './pages/users/list'
import { UserShow } from './pages/users/show'
import { MovieList } from './pages/movies/list'
import { MovieShow } from './pages/movies/show'
import { AuditLogList } from './pages/audit/list'

dayjs.locale('ko')

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={koKR} theme={antdTheme}>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            authProvider={authProvider}
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              { name: 'users', list: '/users', show: '/users/show/:id', meta: { label: '회원' } },
              { name: 'movies', list: '/movies', show: '/movies/show/:id', meta: { label: '영화' } },
              { name: 'audit-logs', list: '/audit-logs', meta: { label: '감사 로그' } },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: false, disableTelemetry: true }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
                    <ThemedLayout Title={({ collapsed }) => <BrandTitle collapsed={collapsed} />}>
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<NavigateToResource resource="users" />} />
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="show/:id" element={<UserShow />} />
                </Route>
                <Route path="/movies">
                  <Route index element={<MovieList />} />
                  <Route path="show/:id" element={<MovieShow />} />
                </Route>
                <Route path="/audit-logs">
                  <Route index element={<AuditLogList />} />
                </Route>
                <Route path="*" element={<ErrorComponent />} />
              </Route>
              <Route
                element={
                  <Authenticated key="public" fallback={<Outlet />}>
                    <NavigateToResource resource="users" />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<LoginPage />} />
              </Route>
            </Routes>
            <DocumentTitleHandler handler={() => 'CineMory 관리자'} />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  )
}
