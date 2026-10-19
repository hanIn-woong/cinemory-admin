import type { AdminAuditLog } from '../../api/types'

// 상세(detail JSON) 펼침 — 없으면 안내만
export function AuditDetail({ detail }: { detail: AdminAuditLog['detail'] }) {
  if (!detail || Object.keys(detail).length === 0) {
    return <span style={{ opacity: 0.55 }}>상세 값 없음</span>
  }
  return (
    <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
      {JSON.stringify(detail, null, 2)}
    </pre>
  )
}
