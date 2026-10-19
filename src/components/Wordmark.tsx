// 앱 홈의 워드마크(L1 — 'C'만 필름 압출 마크, brand-wordmark-spec.md). public/wordmark.png는
// cinemory-app/design/logo-candidates/wordmark-L1-filmC-icon-weight@3x.png의 복사본(753×176, 투명 배경)이다.
// 3x 원본이라 높이 20~64px 범위에서 선명하다 — 더 크게 쓰면 흐려진다.
const ASPECT = 753 / 176

export function Wordmark({ height }: { height: number }) {
  return <img src="/wordmark.png" alt="CineMory" height={height} width={Math.round(height * ASPECT)} style={{ display: 'block' }} />
}
