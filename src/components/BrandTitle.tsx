import { BrandMark } from './BrandMark'
import { Wordmark } from './Wordmark'

// 사이드바 상단 — 펼침: 워드마크 + "관리자", 접힘: 앱 아이콘만
export function BrandTitle({ collapsed }: { collapsed: boolean }) {
  return (
    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
      {collapsed ? (
        <BrandMark size={28} />
      ) : (
        <>
          <Wordmark height={22} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#717182', letterSpacing: 1 }}>관리자</span>
        </>
      )}
    </a>
  )
}
