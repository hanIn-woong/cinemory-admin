import { List, useTable } from '@refinedev/antd'
import { Button, Input, Select, Space, Switch, Table, Tag, Typography } from 'antd'
import { useState } from 'react'
import { THEATER_CHAINS } from '../../api/types'
import type { AdminTheater } from '../../api/types'
import { Ellipsis } from '../../components/Ellipsis'
import { SeedModal } from './SeedModal'
import { TheaterDrawer } from './TheaterDrawer'

// 극장 관리(admin-spec 15-2 · 19-4) — 검색 + 필터(체인 · 예매 링크 없음 · 폐업 · 덮어쓴 극장) · 행 클릭 시 상세 서랍 · 동기화.
// 필터 상태는 URL 필터가 원천이다(새로고침·링크 공유에도 유지).
export function TheaterList() {
  const { tableProps, setFilters, filters, tableQuery } = useTable<AdminTheater>({
    resource: 'theaters',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { mode: 'server' },
  })
  const [selected, setSelected] = useState<AdminTheater | null>(null)
  const [seedOpen, setSeedOpen] = useState(false)

  const filterOf = (field: string) => {
    const f = filters.find((x) => 'field' in x && x.field === field)
    return f && 'value' in f && f.value !== '' ? String(f.value) : undefined
  }
  const set = (field: string, value: string) => setFilters([{ field, operator: 'eq', value }], 'merge')

  return (
    <List headerButtons={<Button type="primary" onClick={() => setSeedOpen(true)}>극장 동기화</Button>}>
      <Space style={{ marginBottom: 16 }} size={[16, 12]} wrap>
        <Input.Search
          allowClear
          placeholder="이름·주소 검색"
          style={{ width: 240 }}
          onSearch={(value) => set('query', value.trim())}
        />
        <Select
          allowClear
          placeholder="체인 전체"
          style={{ width: 140 }}
          value={filterOf('chain')}
          options={THEATER_CHAINS.map((c) => ({ value: c, label: c }))}
          onChange={(value) => set('chain', value ?? '')}
        />
        <Space>
          <Switch checked={filterOf('hasBookingUrl') === 'false'} onChange={(on) => set('hasBookingUrl', on ? 'false' : '')} />
          <Typography.Text>예매 링크 없음</Typography.Text>
        </Space>
        <Space>
          <Switch checked={filterOf('closed') === 'true'} onChange={(on) => set('closed', on ? 'true' : '')} />
          <Typography.Text>폐업</Typography.Text>
        </Space>
        <Space>
          <Switch checked={filterOf('nameOverridden') === 'true'} onChange={(on) => set('nameOverridden', on ? 'true' : '')} />
          <Typography.Text>덮어쓴 극장</Typography.Text>
        </Space>
      </Space>
      <Table<AdminTheater> {...tableProps} rowKey="theaterId" scroll={{ x: 'max-content' }}>
        <Table.Column<AdminTheater>
          title="극장명"
          render={(_, row) => (
            <>
              <Ellipsis text={row.name ?? ''}>
                <a onClick={() => setSelected(row)}>{row.name}</a>
              </Ellipsis>
              {row.nameOverride && (
                <Tag color="cyan" style={{ marginLeft: 6 }}>
                  덮어씀
                </Tag>
              )}
              {row.closedAt && (
                <Tag color="red" style={{ marginLeft: 6 }}>
                  폐업
                </Tag>
              )}
              {/* 원본 이름이 표시 이름과 다를 때만 보여 준다 — 규칙·덮어쓰기가 무엇을 바꿨는지 한눈에 */}
              {row.sourceName && row.sourceName !== row.name && (
                <div>
                  <Ellipsis text={`원본: ${row.sourceName}`} style={{ fontSize: 12, opacity: 0.65 }} />
                </div>
              )}
            </>
          )}
        />
        <Table.Column dataIndex="chainName" title="체인" width={110} />
        <Table.Column<AdminTheater> title="주소" render={(_, row) => <Ellipsis text={row.address ?? ''} maxWidth={360} />} />
        <Table.Column dataIndex="screenCount" title="관 수" width={70} />
        <Table.Column<AdminTheater>
          title="예매 링크"
          width={100}
          render={(_, row) => (row.bookingUrl ? <Tag color="green">있음</Tag> : <span style={{ opacity: 0.55 }}>없음</span>)}
        />
      </Table>
      <TheaterDrawer
        theater={selected}
        onClose={() => setSelected(null)}
        onChanged={(saved) => setSelected(saved)}
      />
      <SeedModal open={seedOpen} onClose={() => setSeedOpen(false)} onDone={() => tableQuery.refetch()} />
    </List>
  )
}
