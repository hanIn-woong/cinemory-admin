import { useList } from '@refinedev/core'
import { Card, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import type { AdminAuditLog, AuditTargetType } from '../../api/types'
import { AUDIT_ACTION_LABELS } from '../../api/types'
import { AuditDetail } from './AuditDetail'

// 회원·영화 상세 하단 — 이 대상의 최근 기록 5건(targetType + targetId 필터, admin-spec 11-5)
export function RecentAuditLogs({ targetType, targetId }: { targetType: AuditTargetType; targetId: string | undefined }) {
  const { result, query } = useList<AdminAuditLog>({
    resource: 'audit-logs',
    pagination: { currentPage: 1, pageSize: 5 },
    filters: [
      { field: 'targetType', operator: 'eq', value: targetType },
      { field: 'targetId', operator: 'eq', value: targetId ?? '' },
    ],
    queryOptions: { enabled: !!targetId },
  })

  return (
    <Card size="small" title="이 대상의 최근 기록" style={{ marginTop: 24 }}>
      <Table<AdminAuditLog>
        size="small"
        rowKey="id"
        loading={query.isLoading}
        dataSource={result.data}
        pagination={false}
        locale={{ emptyText: '기록이 없습니다.' }}
        expandable={{ expandedRowRender: (row) => <AuditDetail detail={row.detail} /> }}
      >
        <Table.Column dataIndex="createdAt" title="시각" render={(v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-')} />
        <Table.Column dataIndex="adminEmail" title="관리자" />
        <Table.Column<AdminAuditLog>
          dataIndex="action"
          title="동작"
          render={(action: AdminAuditLog['action']) => <Tag>{(action && AUDIT_ACTION_LABELS[action]) ?? action}</Tag>}
        />
      </Table>
    </Card>
  )
}
