import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// dev 프록시 — 브라우저 입장에서 /api가 같은 출처라 백엔드 CORS 설정을 건드리지 않는다(admin-spec AD-4).
// ⚠️ 브라우저는 같은 출처 POST에도 Origin: http://localhost:5173을 붙이고, 프록시는 Host만 localhost:8080으로 바꾼다.
// Spring은 둘을 비교해 CORS 요청으로 판정하고 403 "Invalid CORS request"를 낸다(로그인 POST가 이렇게 실패했다).
// 운영은 Nginx가 Host·X-Forwarded-*를 전달해 같은 출처로 인식된다 — dev에서는 Origin을 떼어 같은 효과를 낸다.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
