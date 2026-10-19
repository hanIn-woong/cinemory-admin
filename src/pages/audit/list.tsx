import { List, useTable } from '@refinedev/antd'
import { DatePicker, Select, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import type { AdminAuditLog } from '../../api/types'
import { AUDIT_ACTION_LABELS } from '../../api/types'
import { AuditDetail } from './AuditDetail'
import { AuditTarget } from './AuditTarget'

const DATE = 'YYYY-MM-DD'

// 감사 로그 — 최신순 고정(정렬 선택 없음). 필터: 동작 · 기간(KST 날짜, to 포함).
export function AuditLogList() {
  const { tableProps, setFilters } = useTable<AdminAuditLog>({
    resource: 'audit-logs',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { mode: 'server' },
  })

  return (
    <List>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="동작 전체"
          style={{ width: 200 }}
          options={Object.entries(AUDIT_ACTION_LABELS).map(([value, label]) => ({ value, label }))}
          onChange={(value) => setFilters([{ field: 'action', operator: 'eq', value: value ?? '' }], 'merge')}
        />
        <DatePicker.RangePicker
          allowClear
          placeholder={['시작일', '종료일']}
          onChange={(range) =>
            setFilters(
              [
                { field: 'from', operator: 'eq', value: range?.[0]?.format(DATE) ?? '' },
                { field: 'to', operator: 'eq', value: range?.[1]?.format(DATE) ?? '' },
              ],
              'merge',
            )
          }
        />
      </Space>
      <Table<AdminAuditLog>
        {...tableProps}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        expandable={{ expandedRowRender: (row) => <AuditDetail detail={row.detail} /> }}
      >
        <Table.Column dataIndex="createdAt" title="시각" render={(v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-')} />
        <Table.Column dataIndex="adminEmail" title="관리자" />
        <Table.Column<AdminAuditLog>
          dataIndex="action"
          title="동작"
          render={(action: AdminAuditLog['action']) => <Tag>{(action && AUDIT_ACTION_LABELS[action]) ?? action}</Tag>}
        />
        <Table.Column<AdminAuditLog> title="대상" render={(_, row) => <AuditTarget log={row} />} />
        <Table.Column dataIndex="ip" title="IP" render={(v) => v ?? '-'} />
      </Table>
    </List>
  )
}
