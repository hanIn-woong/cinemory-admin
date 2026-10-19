import { Link } from 'react-router'
import type { AdminAuditLog } from '../../api/types'

const TARGET_LABEL = { USER: '회원', MOVIE: '영화', PERSON: '인물' } as const

// 대상 — 회원·영화는 상세로 링크, 인물 화면은 B-2에서 생긴다. 대상 없는 일괄 작업은 "-".
export function AuditTarget({ log }: { log: Pick<AdminAuditLog, 'targetType' | 'targetId'> }) {
  if (!log.targetType || log.targetId == null) return <span style={{ opacity: 0.55 }}>-</span>
  const label = `${TARGET_LABEL[log.targetType]} #${log.targetId}`
  if (log.targetType === 'USER') return <Link to={`/users/show/${log.targetId}`}>{label}</Link>
  if (log.targetType === 'MOVIE') return <Link to={`/movies/show/${log.targetId}`}>{label}</Link>
  return <span>{label}</span>
}
