// 앱 아이콘(H3a 필름 압출 C) — public/icon.png는 앱 assets/icon.png의 복사본이다. 정사각형이라 둥근 모서리로 앱 아이콘처럼 보이게 한다.
export function BrandMark({ size }: { size: number }) {
  return <img src="/icon.png" alt="CineMory" width={size} height={size} style={{ borderRadius: size * 0.22, display: 'block' }} />
}
