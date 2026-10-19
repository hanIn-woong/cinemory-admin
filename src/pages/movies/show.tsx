import { Show } from '@refinedev/antd'
import { useCustomMutation, useInvalidate, useShow } from '@refinedev/core'
import { App, Button, Card, Col, Descriptions, Image, Row, Space, Statistic, Tag } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useParams } from 'react-router'
import { ApiError } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import type { AdminMovieDetail } from '../../api/types'
import { PosterSize, tmdbImageUrl, tmdbMovieUrl } from '../../constants/tmdb'
import { RecentAuditLogs } from '../audit/RecentAuditLogs'

const fmt = (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-')

// 재동기화 실패는 code로 분기해 사유를 구분해 안내한다(admin-spec 6-4).
function resyncErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'SEED_ALREADY_RUNNING':
        return '다른 동기화 작업이 실행 중입니다. 끝난 뒤 다시 시도해 주세요.'
      case 'TMDB_RATE_LIMITED':
        return 'TMDB 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.'
      case 'TMDB_MOVIE_NOT_FOUND':
        return 'TMDB에서 삭제된 영화입니다. 우리 데이터는 그대로 유지됩니다.'
      default:
        return error.message
    }
  }
  return '재동기화에 실패했습니다.'
}

export function MovieShow() {
  const { id } = useParams()
  const { message, modal } = App.useApp()
  const { query } = useShow<AdminMovieDetail>({ resource: 'movies', id })
  const { mutateAsync, mutation } = useCustomMutation<AdminMovieDetail>()
  const invalidate = useInvalidate()
  // 재동기화 응답으로 화면을 바로 갱신한다
  const [refreshed, setRefreshed] = useState<AdminMovieDetail | null>(null)

  const movie = refreshed ?? query.data?.data

  const resync = () =>
    modal.confirm({
      title: 'TMDB에서 이 영화를 다시 받아 갱신할까요?',
      content: '제목·줄거리·출연진 등이 TMDB 최신 값으로 덮어써집니다.',
      okText: '재동기화',
      cancelText: '취소',
      onOk: async () => {
        try {
          const result = await mutateAsync({
            url: endpoints.adminMovieResync(id ?? ''),
            method: 'post',
            values: {},
            successNotification: false,
            errorNotification: false,
          })
          setRefreshed(result.data)
          // 방금 한 동작이 "이 대상의 최근 기록"에 바로 보이게 감사 로그 목록을 다시 받는다
          await invalidate({ resource: 'audit-logs', invalidates: ['list'] })
          message.success('재동기화가 완료되었습니다.')
        } catch (e) {
          message.error(resyncErrorMessage(e))
        }
      },
    })

  const poster = tmdbImageUrl(movie?.posterPath, PosterSize.DETAIL)
  const usage = movie?.usage

  return (
    <Show
      isLoading={query.isLoading}
      canEdit={false}
      canDelete={false}
      title="영화 상세"
      headerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          <Button type="primary" onClick={resync} loading={mutation.isPending}>
            TMDB 재동기화
          </Button>
        </>
      )}
    >
      {movie && (
        <>
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col xs={24} md={6}>
              {poster ? (
                <Image src={poster} alt="" style={{ maxWidth: '100%' }} />
              ) : (
                <div style={{ height: 240, background: 'rgba(128,128,128,.2)', borderRadius: 8 }} />
              )}
            </Col>
            <Col xs={24} md={18}>
              <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
                <Descriptions.Item label="영화 ID">{movie.movieId}</Descriptions.Item>
                <Descriptions.Item label="TMDB ID">
                  <a href={tmdbMovieUrl(movie.tmdbId ?? 0)} target="_blank" rel="noreferrer">
                    {movie.tmdbId}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="제목">{movie.title}</Descriptions.Item>
                <Descriptions.Item label="원제">{movie.originalTitle ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="개봉일">{movie.releaseDate ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="상영시간">{movie.runtime ? `${movie.runtime}분` : '-'}</Descriptions.Item>
                <Descriptions.Item label="평점">
                  {movie.voteAverage != null ? `${movie.voteAverage} (${movie.voteCount ?? 0}표)` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="KOFIC 코드">{movie.koficMovieCd ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="등록일">{fmt(movie.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="마지막 동기화">
                  {movie.syncedAt ? fmt(movie.syncedAt) : <span style={{ opacity: 0.55 }}>기록 없음(도입 전)</span>}
                </Descriptions.Item>
                <Descriptions.Item label="장르" span={2}>
                  <Space wrap>{(movie.genres ?? []).map((g) => <Tag key={g}>{g}</Tag>)}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="국가" span={2}>
                  <Space wrap>{(movie.countries ?? []).map((c) => <Tag key={c}>{c}</Tag>)}</Space>
                </Descriptions.Item>
                <Descriptions.Item label="감독" span={2}>
                  {(movie.directors ?? []).join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="출연진 수">{movie.castCount ?? 0}명</Descriptions.Item>
                <Descriptions.Item label="줄거리" span={2}>
                  {movie.overview || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {(
              [
                ['시청 기록', usage?.watchRecordCount],
                ['리뷰', usage?.reviewCount],
                ['찜', usage?.wishCount],
                ['컬렉션', usage?.collectionCount],
              ] as const
            ).map(([label, value]) => (
              <Col key={label} xs={12} md={6}>
                <Card size="small">
                  <Statistic title={label} value={value ?? 0} />
                </Card>
              </Col>
            ))}
          </Row>
          <RecentAuditLogs targetType="MOVIE" targetId={id} />
        </>
      )}
    </Show>
  )
}
