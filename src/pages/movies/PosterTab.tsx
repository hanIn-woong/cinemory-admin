import { useCustom, useCustomMutation } from '@refinedev/core'
import { Alert, App, Button, Card, Col, Empty, Image, Row, Space, Spin, Tag, Typography } from 'antd'
import { useState } from 'react'
import { ApiError } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import type { AdminMovieDetail, AdminMoviePosters, AdminPosterCandidate, AdminPosterUnpinResult } from '../../api/types'
import { PosterSize, tmdbImageUrl } from '../../constants/tmdb'

const LANGUAGE_LABEL: Record<string, string> = { ko: '한국어', en: '영어' }
const languageLabel = (code: string | undefined) => (code ? (LANGUAGE_LABEL[code] ?? code) : '언어 없음')

// 영화 상세의 "포스터" 탭(admin-spec 18-5, DD-5·6) — TMDB 후보를 그때그때 받아 한 장을 고정한다.
// 고정하면 재동기화·온디맨드 sync가 이 값을 유지하고, 해제하면 서버가 TMDB 기본 포스터로 즉시 되돌린다(실패 시 resynced:false).
export function PosterTab({ movieId, onChanged }: { movieId: string | undefined; onChanged: (movie: AdminMovieDetail) => void | Promise<void> }) {
  const { message } = App.useApp()
  const { query } = useCustom<AdminMoviePosters>({
    url: endpoints.adminMoviePosters(movieId ?? ''),
    method: 'get',
    queryOptions: { enabled: !!movieId, retry: false },
  })
  const { mutateAsync, mutation } = useCustomMutation<AdminMovieDetail | AdminPosterUnpinResult>()
  // 변경 응답으로 현재·고정 표시를 바로 갱신한다(후보 목록은 그대로 — TMDB를 다시 부르지 않는다)
  const [override, setOverride] = useState<{ current?: string; pinned?: string } | null>(null)
  const [busyPath, setBusyPath] = useState<string | null>(null)

  const data = query.data?.data
  const current = override ? override.current : data?.current
  const pinned = override ? override.pinned : data?.pinned

  const pin = async (filePath: string) => {
    setBusyPath(filePath)
    try {
      const result = await mutateAsync({
        url: endpoints.adminMoviePoster(movieId ?? ''),
        method: 'put',
        values: { filePath },
        successNotification: false,
        errorNotification: false,
      })
      const movie = result.data as AdminMovieDetail
      setOverride({ current: movie.posterPath, pinned: movie.posterPathPinned })
      await onChanged(movie)
      message.success('포스터를 고정했습니다.')
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '포스터 고정에 실패했습니다.')
    } finally {
      setBusyPath(null)
    }
  }

  const unpin = async () => {
    try {
      const result = await mutateAsync({
        url: endpoints.adminMoviePoster(movieId ?? ''),
        method: 'delete',
        values: {},
        successNotification: false,
        errorNotification: false,
      })
      const { movie, resynced } = result.data as AdminPosterUnpinResult
      if (movie) {
        setOverride({ current: movie.posterPath, pinned: movie.posterPathPinned })
        await onChanged(movie)
      }
      if (resynced) message.success('고정을 해제하고 TMDB 기본 포스터로 되돌렸습니다.')
      else message.warning('고정을 해제했습니다. TMDB 기본 포스터는 다음 동기화 때 돌아옵니다.')
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '고정 해제에 실패했습니다.')
    }
  }

  if (query.isLoading) return <Spin style={{ display: 'block', margin: '48px auto' }} />
  if (query.isError) {
    const error = query.error as unknown
    return (
      <Alert
        type="error"
        showIcon
        message="포스터 후보를 불러오지 못했습니다."
        description={error instanceof ApiError ? error.message : 'TMDB 응답 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.'}
        action={<Button onClick={() => query.refetch()}>다시 시도</Button>}
      />
    )
  }

  const candidates = data?.candidates ?? []
  const currentUrl = tmdbImageUrl(current, PosterSize.DETAIL)

  return (
    <>
      <Space align="start" size={24} style={{ marginBottom: 24 }} wrap>
        {currentUrl ? <Image src={currentUrl} width={150} alt="" /> : <div style={{ width: 150, height: 225, background: 'rgba(128,128,128,.2)', borderRadius: 8 }} />}
        <Space direction="vertical">
          <Typography.Text strong>현재 포스터</Typography.Text>
          {pinned ? <Tag color="cyan">고정됨</Tag> : <Tag>TMDB 기본</Tag>}
          <Typography.Text type="secondary">고정하면 재동기화·TMDB 동기화가 이 포스터를 유지합니다.</Typography.Text>
          {pinned && (
            <Button danger onClick={unpin} loading={mutation.isPending && busyPath === null}>
              고정 해제
            </Button>
          )}
        </Space>
      </Space>

      <Typography.Title level={5}>TMDB 후보 ({candidates.length}장 · 한국어 → 언어 없음 → 영어)</Typography.Title>
      {candidates.length === 0 ? (
        <Empty description="TMDB에 포스터 후보가 없습니다." />
      ) : (
        <Row gutter={[16, 16]}>
          {candidates.map((c: AdminPosterCandidate) => {
            const isCurrent = c.filePath === current
            return (
              <Col key={c.filePath} xs={12} sm={8} md={6} xl={4}>
                <Card
                  size="small"
                  styles={{ body: { padding: 8 } }}
                  style={isCurrent ? { border: '2px solid #14D9D9' } : undefined}
                  cover={<Image src={tmdbImageUrl(c.filePath, PosterSize.DETAIL) ?? ''} alt="" loading="lazy" />}
                >
                  <Space size={4} wrap style={{ marginBottom: 8 }}>
                    <Tag>{languageLabel(c.language)}</Tag>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {c.width}×{c.height}
                    </Typography.Text>
                  </Space>
                  <Button
                    block
                    size="small"
                    type={isCurrent ? 'default' : 'primary'}
                    disabled={isCurrent && !!pinned}
                    loading={busyPath === c.filePath}
                    onClick={() => c.filePath && pin(c.filePath)}
                  >
                    {isCurrent ? (pinned ? '고정됨' : '이 포스터로 고정') : '이 포스터로 고정'}
                  </Button>
                </Card>
              </Col>
            )
          })}
        </Row>
      )}
    </>
  )
}
