import type { CSSProperties, ReactNode } from 'react'

// 한 줄로 자르고 "…"을 붙인다 — 긴 제목이 목록 행을 늘리거나 표를 옆으로 밀지 않게 한다.
// 전체 텍스트는 마우스를 올리면 브라우저 툴팁(title)으로 보인다. text는 툴팁과 접근성용 원문, children은 화면에 그릴 내용(링크 등).
export function Ellipsis({
  text,
  maxWidth = 320,
  style,
  children,
}: {
  text: string
  maxWidth?: number
  style?: CSSProperties
  children?: ReactNode
}) {
  return (
    <span
      title={text}
      style={{
        display: 'inline-block',
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
        ...style,
      }}
    >
      {children ?? text}
    </span>
  )
}
