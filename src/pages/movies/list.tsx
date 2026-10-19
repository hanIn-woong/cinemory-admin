import { List, useTable } from '@refinedev/antd'
import { Image, Input, InputNumber, Select, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router'
import type { AdminMovieSummary } from '../../api/types'
import { MOVIE_SORTS } from '../../api/types'
import { PosterSize, tmdbImageUrl, tmdbMovieUrl } from '../../constants/tmdb'

export function MovieList() {
  const { tableProps, setFilters } = useTable<AdminMovieSummary>({
    resource: 'movies',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { initial: [{ field: 'sort', operator: 'eq', value: 'ID_DESC' }], mode: 'server' },
  })

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
          defaultValue="ID_DESC"
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
          render={(_, row) => (
            <>
              <Link to={`/movies/show/${row.movieId}`}>{row.title}</Link>
              {row.originalTitle && row.originalTitle !== row.title && (
                <div style={{ fontSize: 12, opacity: 0.65 }}>{row.originalTitle}</div>
              )}
            </>
          )}
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
