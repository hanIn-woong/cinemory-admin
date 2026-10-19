import { useCustom } from '@refinedev/core'
import { Table, Tag, Typography } from 'antd'
import { endpoints } from '../../api/endpoints'
import type { AdminCreditItem, AdminMovieCredits } from '../../api/types'
import { tmdbPersonUrl } from '../../constants/tmdb'
import { NameKoEditor } from '../persons/NameKoEditor'
import { PersonPhoto } from '../persons/PersonPhoto'

// 영화 상세의 "출연진·감독" 탭(admin-spec 12-4, BD-8) — 행마다 사진 · TMDB 이름 · 한글명 입력칸 · 저장.
// 출연진은 앱 영화 상세가 보여 주는 범위(display_order ≤ 20)와 같다. 전체 출연진은 인물 화면에서 찾는다.
export function MovieCredits({ movieId }: { movieId: string | undefined }) {
  const { query } = useCustom<AdminMovieCredits>({
    url: endpoints.adminMovieCredits(movieId ?? ''),
    method: 'get',
    queryOptions: { enabled: !!movieId },
  })
  const credits = query.data?.data

  const nameColumns = [
    <Table.Column<AdminCreditItem> key="photo" title="사진" width={72} render={(_, row) => <PersonPhoto profilePath={row.profilePath} />} />,
    <Table.Column<AdminCreditItem>
      key="name"
      title="TMDB 이름"
      render={(_, row) => (
        <a href={tmdbPersonUrl(row.tmdbPersonId ?? 0)} target="_blank" rel="noreferrer">
          {row.name}
        </a>
      )}
    />,
    <Table.Column<AdminCreditItem>
      key="nameKo"
      title="한글명"
      render={(_, row) => <NameKoEditor key={row.personId} personId={row.personId ?? 0} nameKo={row.nameKo} />}
    />,
  ]

  return (
    <>
      <Typography.Title level={5}>감독</Typography.Title>
      <Table<AdminCreditItem>
        size="small"
        rowKey="personId"
        loading={query.isLoading}
        dataSource={credits?.directors}
        pagination={false}
        locale={{ emptyText: '감독 정보가 없습니다.' }}
      >
        {nameColumns}
      </Table>

      <Typography.Title level={5} style={{ marginTop: 24 }}>
        출연진
      </Typography.Title>
      <Table<AdminCreditItem>
        size="small"
        rowKey="personId"
        loading={query.isLoading}
        dataSource={credits?.cast}
        pagination={false}
        locale={{ emptyText: '출연진 정보가 없습니다.' }}
      >
        {nameColumns}
        <Table.Column<AdminCreditItem> key="character" title="배역" render={(_, row) => row.characterName || '-'} />
        <Table.Column<AdminCreditItem>
          key="tier"
          title="비중"
          width={110}
          render={(_, row) => (row.roleTier ? <Tag>{row.roleTier}</Tag> : '-')}
        />
      </Table>
    </>
  )
}
