import { List, useTable } from '@refinedev/antd'
import { Input, Space, Switch, Table, Typography } from 'antd'
import type { AdminPersonSummary } from '../../api/types'
import { tmdbPersonUrl } from '../../constants/tmdb'
import { NameKoEditor } from './NameKoEditor'
import { PersonPhoto } from './PersonPhoto'

// 인물(admin-spec 12-4) — 검색 · "한글명 없는 인물만" 토글 · 인라인 편집. id 오름차순 고정(정렬 선택 없음).
// 인물이 약 23만 명이라 처음에는 전체 목록이 길다 — 작업은 토글을 켜고 이름으로 좁혀서 한다.
export function PersonList() {
  const { tableProps, setFilters, filters } = useTable<AdminPersonSummary>({
    resource: 'persons',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { mode: 'server' },
  })

  // 토글 상태는 URL 필터가 원천이다 — 대시보드 알림 링크(?filters[0]…missingKorean=true)로 들어와도 켜진 채로 보인다
  const missingKorean = filters.some((f) => 'field' in f && f.field === 'missingKorean' && f.value === 'true')

  return (
    <List>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="이름 또는 한글명 검색"
          style={{ width: 260 }}
          onSearch={(value) => setFilters([{ field: 'q', operator: 'eq', value: value.trim() }], 'merge')}
        />
        <Space>
          <Switch
            checked={missingKorean}
            onChange={(checked) =>
              setFilters([{ field: 'missingKorean', operator: 'eq', value: checked ? 'true' : '' }], 'merge')
            }
          />
          <Typography.Text>한글명 없는 인물만</Typography.Text>
        </Space>
      </Space>
      <Table<AdminPersonSummary> {...tableProps} rowKey="personId" scroll={{ x: 'max-content' }}>
        <Table.Column<AdminPersonSummary> title="사진" width={72} render={(_, row) => <PersonPhoto profilePath={row.profilePath} />} />
        <Table.Column<AdminPersonSummary>
          title="TMDB 이름"
          render={(_, row) => (
            <a href={tmdbPersonUrl(row.tmdbPersonId ?? 0)} target="_blank" rel="noreferrer">
              {row.name}
            </a>
          )}
        />
        <Table.Column<AdminPersonSummary>
          title="한글명"
          render={(_, row) => <NameKoEditor key={`${row.personId}:${row.nameKo ?? ''}`} personId={row.personId ?? 0} nameKo={row.nameKo} />}
        />
        <Table.Column dataIndex="creditCount" title="출연·연출" width={100} />
      </Table>
    </List>
  )
}
