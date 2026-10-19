import { List, useTable } from '@refinedev/antd'
import { Image, Input, InputNumber, Select, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router'
import type { AdminMovieSummary } from '../../api/types'
import { MOVIE_SORTS } from '../../api/types'
import { Ellipsis } from '../../components/Ellipsis'
import { PosterSize, tmdbImageUrl, tmdbMovieUrl } from '../../constants/tmdb'

export function MovieList() {
  const { tableProps, setFilters, filters } = useTable<AdminMovieSummary>({
    resource: 'movies',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { initial: [{ field: 'sort', operator: 'eq', value: 'ID_DESC' }], mode: 'server' },
  })

  // 정렬 선택은 URL 필터가 원천이다 — 대시보드 알림 링크(…sort=SYNCED_AT_ASC)로 들어와도 그 정렬이 선택돼 보인다
  const sortFilter = filters.find((f) => 'field' in f && f.field === 'sort')
  const sort = sortFilter && 'value' in sortFilter ? String(sortFilter.value) : 'ID_DESC'

  return (
    <List>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="제목 또는 원제 검색"
          style={{ width: 260 }}
          onSearch={(value) => setFilters([{ field: 'q', operator: 'eq', value: value.trim() }], 'merge')}
        />
        <InputNumber
          placeholder="TMDB ID"
          controls={false}
          min={1}
          style={{ width: 130 }}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value.trim()
            setFilters([{ field: 'tmdbId', operator: 'eq', value }], 'merge')
          }}
        />
        <Select
          value={sort}
          style={{ width: 180 }}
          options={MOVIE_SORTS.map((s) => ({ value: s.value, label: s.label }))}
          onChange={(value) => setFilters([{ field: 'sort', operator: 'eq', value }], 'merge')}
        />
      </Space>
      <Table<AdminMovieSummary> {...tableProps} rowKey="movieId" scroll={{ x: 'max-content' }}>
        <Table.Column<AdminMovieSummary>
          title="포스터"
          width={72}
          render={(_, row) => {
            const url = tmdbImageUrl(row.posterPath, PosterSize.THUMB)
            return url ? (
              <Image src={url} width={40} preview={false} alt="" />
            ) : (
              <div style={{ width: 40, height: 60, background: 'rgba(128,128,128,.2)', borderRadius: 4 }} />
            )
          }}
        />
        <Table.Column<AdminMovieSummary>
          title="제목"
          render={(_, row) => {
            // 표시 제목(한글 제목 우선)이 앱에 보이는 제목이다. 아래 줄은 원제(없으면 한글 제목이 덮은 TMDB 제목)
            const shown = row.titleKo ?? row.title
            const sub = row.originalTitle ?? (row.titleKo ? row.title : undefined)
            return (
              <>
                {/* 긴 제목은 한 줄에서 자르고 전체는 마우스를 올리면 보인다 */}
                <div>
                  <Ellipsis text={shown ?? ''}>
                    <Link to={`/movies/show/${row.movieId}`}>{shown}</Link>
                  </Ellipsis>
                </div>
                {sub && sub !== shown && (
                  <div>
                    <Ellipsis text={sub} style={{ fontSize: 12, opacity: 0.65 }} />
                  </div>
                )}
              </>
            )
          }}
        />
        <Table.Column dataIndex="releaseDate" title="개봉일" render={(v) => v ?? '-'} />
        <Table.Column<AdminMovieSummary>
          dataIndex="tmdbId"
          title="TMDB ID"
          render={(id) => (
            <a href={tmdbMovieUrl(id)} target="_blank" rel="noreferrer">
              {id}
            </a>
          )}
        />
        <Table.Column<AdminMovieSummary>
          title="평점"
          render={(_, row) => (row.voteAverage != null ? `${row.voteAverage} (${row.voteCount ?? 0})` : '-')}
        />
        <Table.Column dataIndex="createdAt" title="등록일" render={(v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')} />
        <Table.Column
          dataIndex="syncedAt"
          title="마지막 동기화"
          render={(v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : <span style={{ opacity: 0.55 }}>기록 없음(도입 전)</span>)}
        />
      </Table>
    </List>
  )
}
