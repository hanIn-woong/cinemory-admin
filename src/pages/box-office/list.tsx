import { List, useTable } from '@refinedev/antd'
import { Button, Table, Typography } from 'antd'
import { useState } from 'react'
import type { AdminUnlinkedBoxOffice } from '../../api/types'
import { Ellipsis } from '../../components/Ellipsis'
import { LinkMovieModal } from './LinkMovieModal'

// 박스오피스 미연결 목록(admin-spec 17-4) — KOFIC 코드 단위. 최근에 순위에 오른 것이 위(서버 고정 정렬).
// 연결하면 그 코드의 모든 날짜 기록이 한 번에 영화에 붙고 목록에서 사라진다.
export function BoxOfficeUnlinkedList() {
  const { tableProps, tableQuery } = useTable<AdminUnlinkedBoxOffice>({
    resource: 'box-office',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { mode: 'server' },
  })
  const [target, setTarget] = useState<AdminUnlinkedBoxOffice | null>(null)

  return (
    <List>
      <Typography.Paragraph type="secondary">
        영화와 연결되지 않은 박스오피스 기록입니다. 연결한 코드는 영화에 저장되어 다음 수집부터 자동으로 이어집니다.
      </Typography.Paragraph>
      <Table<AdminUnlinkedBoxOffice> {...tableProps} rowKey="koficMovieCd" scroll={{ x: 'max-content' }}>
        <Table.Column<AdminUnlinkedBoxOffice> title="제목" render={(_, row) => <Ellipsis text={row.title ?? ''} />} />
        <Table.Column dataIndex="koficMovieCd" title="KOFIC 코드" />
        <Table.Column dataIndex="openDate" title="개봉일" render={(v) => v ?? '-'} />
        <Table.Column<AdminUnlinkedBoxOffice> title="순위 기간" render={(_, row) => `${row.firstDate ?? '-'} ~ ${row.lastDate ?? '-'}`} />
        <Table.Column dataIndex="bestRank" title="최고 순위" width={90} />
        <Table.Column dataIndex="recordCount" title="기록 수" width={80} />
        <Table.Column<AdminUnlinkedBoxOffice>
          title=""
          width={110}
          render={(_, row) => (
            <Button type="primary" size="small" onClick={() => setTarget(row)}>
              영화 연결
            </Button>
          )}
        />
      </Table>
      <LinkMovieModal
        koficMovieCd={target?.koficMovieCd ?? null}
        boxOfficeTitle={target?.title}
        onClose={() => setTarget(null)}
        onLinked={() => {
          setTarget(null)
          tableQuery.refetch()
        }}
      />
    </List>
  )
}
