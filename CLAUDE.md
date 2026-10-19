# cinemory-admin — 작업 규칙

CineMory 관리자 웹(React + Vite + TypeScript + Refine + Ant Design). 운영: `https://admin.cinemory.co.kr`.

## 스펙의 원본은 백엔드 리포다

- **설계·계약·실행 순서·결정 근거 = `../cinemory-backend/docs/admin-spec.md`**(AD-·BD- 확정 기록, API 계약, 단계별 완료 판정).
  이 리포에는 스펙 사본을 두지 않는다. 문서를 고치면 백엔드 리포의 `docs/`를 직접 편집하고 그 문서의 변경 이력에 남긴다.
- 운영 절차: 백엔드 `docs/operations-runbook.md` 2-1(배포·롤백) · `docs/server-setup-runbook.md` 10-⑤·13-⑦(서버·IAM 준비).
- 2단계(감사 로그·인물 한글명·대시보드)는 **백엔드 → 관리자 웹 순서**로 단계마다 닫는다. API가 배포된 뒤 화면을 붙이므로 세션은 백엔드 리포에서 시작하는 것이 기본이고, 이 리포 단독 작업은 화면만 고칠 때다.

## API 계약

- 경로 문자열은 `src/api/endpoints.ts`에만 둔다. 타입은 **`npm run gen:api`로만** 받는다 — `src/api/api.d.ts`는 손으로 고치지 않는다.
  생성은 **로컬 백엔드(`./gradlew bootRun`, 8080)** 의 `/v3/api-docs`에서 한다(운영은 Swagger 차단). 백엔드 API가 바뀌면 재생성해 같이 커밋한다.
- springdoc 생성물은 필드가 전부 optional이다 — 화면에서 `??`로 받는다.
- 목록은 `PageResponse`, **page는 0-based**(Refine은 1-based — `dataProvider`가 변환). 정렬은 컬럼 정렬이 아니라 **`sort` enum 선택 상자**(백엔드 화이트리스트).
- `client.ts`의 **단일 비행 재발급**을 우회하지 않는다. 백엔드가 리프레시 회전 + 재사용 감지를 해서 동시 401에서 `reissue`가 두 번 나가면 그 사용자의 전 세션이 폐기된다.
  모든 요청은 `api.get/post`(= `request`)를 거친다. `fetch`를 직접 부르지 않는다.
- 토큰: Access는 메모리, Refresh는 `sessionStorage`(AD-7).

## ⚠️ main push = 운영 배포

- `main`에 push하면 GitHub Actions `deploy`가 **바로 운영에 배포**한다(`*.md`만 바뀐 push는 제외). 머지 전 `npm run lint && npm run build` 통과 필수.
- 기능은 브랜치에서 만들고, 사용자 확인 뒤에 `main`으로 합친다. 롤백은 서버에서 `current` 링크를 이전 릴리스로 되돌리기(운영 런북 2-1).
- 이메일이 보이는 화면이다 — 스크린샷·데모 영상에는 테스트 계정만 띄운다.

## 이미 겪은 함정 (되풀이하지 않기)

| 증상 | 원인 · 처방 |
|---|---|
| 로컬에서 로그인 POST가 **403 "Invalid CORS request"** | 브라우저가 같은 출처 POST에도 `Origin`을 붙이고 Vite 프록시는 `Host`만 바꾼다. `vite.config.ts`가 프록시에서 `Origin`을 뗀다 — 지우지 않는다. 운영은 Nginx의 `Host`·`X-Forwarded-*`로 해결 |
| `useLocation() may be used only in the context of a <Router>` | `react-router`가 두 벌(8.x + refine의 7.x). **`react-router`는 7.x 고정**(`@refinedev/react-router` 요구 사항) |
| `openapi-typescript` 설치 시 ERESOLVE | 이 패키지가 TypeScript 5.x를 요구한다 — **`typescript`는 5.9로 고정** |
| 제목에 `users.titles.list` 같은 키가 그대로 보임 | Refine i18n 키. `src/providers/i18nProvider.ts`의 `KO` 표에 추가 |
| 새 리포·CI에서 `sts:AssumeRoleWithWebIdentity` 거부 | OIDC `sub` 형식이 `repo:owner@<ID>/repo@<ID>:ref:…`(ID 포함). 신뢰 정책에 정확한 값을 넣는다(와일드카드 금지) — 백엔드 `server-setup-runbook` 13-⑦ |
| 시안(`#14D9D9`) 위 글자가 안 읽힘 | 대비 약 1.7:1. 버튼 글자는 어두운색, 텍스트 링크는 `#1F7A72`(`src/theme/brand.ts` 참고) |
| 로컬 Vite를 껐는데 5173이 안 비워짐 | 자식 프로세스가 남는다 — `netstat -ano \| findstr :5173`로 PID 찾아 종료 |

## 브랜드 에셋은 앱의 복사본이다

- 색: `src/theme/brand.ts` ← 앱 `cinemory-app/src/theme/tokens.ts`. 앱 색을 바꾸면 같이 바꾼다.
- `public/icon.png`·`favicon.png` ← 앱 `assets/`, `public/wordmark.png` ← 앱 `design/logo-candidates/wordmark-L1-filmC-icon-weight@3x.png`(753×176, 높이 20~64px에서 선명). 원본이 바뀌면 직접 다시 복사한다.

## 코드 규칙

- 한국어 주석·커밋 메시지(Conventional Commits, 백엔드 `docs/Conventional_Commits_가이드.md`와 같은 규칙). 커밋 끝에 Co-Authored-By 줄.
- 1단계 범위 밖의 쓰기 동작은 만들지 않는다. 스펙에 없는 기능은 먼저 물어본다.
- 로컬 개발: 백엔드를 8080에서 띄운 뒤 `npm run dev`(5173). 관리자 계정은 개발 DB에서 `UPDATE user SET role = 'ADMIN' …` 후 **다시 로그인**(권한은 로그인 때 토큰에 실린다).
