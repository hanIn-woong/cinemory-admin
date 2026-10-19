# CineMory 관리자 웹 (cinemory-admin)

CineMory 백엔드의 관리자 백오피스. 설계의 진실의 원천은 백엔드 리포의 `docs/admin-spec.md`다.

- 스택: React + Vite + TypeScript + Refine + Ant Design
- 1단계 범위: 회원(목록·검색·상세) · 영화(목록·검색·상세·TMDB 단건 재동기화)
- 인증: `POST /api/auth/login` 후 `GET /api/admin/me`로 관리자 판정. Access Token은 메모리, Refresh Token은 `sessionStorage`

## 로컬 실행

```bash
# 1) 백엔드(../cinemory-backend)를 8080에서 먼저 띄운다: ./gradlew bootRun
npm install
npm run dev        # http://localhost:5173 — /api 는 8080으로 프록시(같은 출처)
```

로컬 관리자 계정은 백엔드 개발 DB에서 `UPDATE user SET role = 'ADMIN' WHERE email = '…'` 후 **다시 로그인**한다.

## 스크립트

| 명령 | 용도 |
|---|---|
| `npm run gen:api` | **로컬 백엔드**의 `/v3/api-docs`에서 `src/api/api.d.ts` 생성(손으로 고치지 않는다). 운영은 Swagger 차단 |
| `npm run build` | `tsc -b` + 프로덕션 번들(`dist/`) |
| `npm run lint` | oxlint |

## 주의

- `vite.config.ts`의 프록시는 `Origin` 헤더를 뗀다. 브라우저가 같은 출처 POST에도 `Origin`을 붙이고 Spring이 `Host`와 비교해 403(Invalid CORS request)을 내기 때문이다. 운영은 Nginx가 `Host`·`X-Forwarded-*`를 전달해 같은 출처로 인식된다.
- `@refinedev/react-router`가 `react-router` 7.x를 요구한다 — 8.x를 설치하면 라우터가 두 벌 생겨 `useLocation() may be used only in the context of a <Router>`가 난다.
- `typescript`는 5.x에 고정(`openapi-typescript`가 5.x를 요구).
- 이메일이 보이는 화면이라 스크린샷·데모 영상에는 테스트 계정만 띄운다.
