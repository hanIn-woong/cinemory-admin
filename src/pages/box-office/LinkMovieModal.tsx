import { useCustomMutation } from '@refinedev/core'
import { App, Button, Empty, Image, Input, List, Modal, Spin, Typography } from 'antd'
import { useState } from 'react'
import { ApiError, api } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import type { AdminMovieSummary, BoxOfficeLinkResult, MovieSearchSuggestion } from '../../api/types'
import { PosterSize, tmdbImageUrl } from '../../constants/tmdb'

interface Props {
  koficMovieCd: string | null
  /** 박스오피스 쪽 제목 — 어떤 영화를 찾는지 보여 준다 */
  boxOfficeTitle?: string
  onClose: () => void
  onLinked: (result: BoxOfficeLinkResult) => void
}

function linkErrorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.code) {
      case 'KOFIC_CODE_CONFLICT':
        return '이미 다른 KOFIC 코드가 연결된 영화이거나, 이 코드가 다른 영화에 붙어 있습니다. 잘못 붙은 연결을 먼저 해제해 주세요.'
      case 'BOX_OFFICE_NOT_FOUND':
        return '연결할 미연결 기록이 없습니다. 이미 연결됐을 수 있습니다.'
      default:
        return e.message
    }
  }
  return '연결에 실패했습니다.'
}

// 박스오피스 코드를 영화에 잇는 대화상자(admin-spec 17-4) — 우리 DB 검색 → 없으면 "TMDB에서 찾기" → 등록 → 연결.
export function LinkMovieModal({ koficMovieCd, boxOfficeTitle, onClose, onLinked }: Props) {
  const { message, modal } = App.useApp()
  const { mutateAsync } = useCustomMutation<BoxOfficeLinkResult>()
  const [keyword, setKeyword] = useState('')
  const [movies, setMovies] = useState<AdminMovieSummary[] | null>(null)
  const [suggestions, setSuggestions] = useState<MovieSearchSuggestion[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setKeyword('')
    setMovies(null)
    setSuggestions(null)
  }
  const close = () => {
    reset()
    onClose()
  }

  const search = async (value: string) => {
    const q = value.trim()
    if (!q) return
    setLoading(true)
    setSuggestions(null)
    try {
      const body = await api.get<{ content?: AdminMovieSummary[] }>(`${endpoints.adminMovies}?q=${encodeURIComponent(q)}&size=10`)
      setMovies(body.content ?? [])
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const searchTmdb = async () => {
    setLoading(true)
    try {
      const body = await api.get<{ suggestions?: MovieSearchSuggestion[] }>(`/api/movies/search?query=${encodeURIComponent(keyword.trim())}`)
      setSuggestions(body.suggestions ?? [])
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : 'TMDB 검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const link = async (movieId: number) => {
    if (!koficMovieCd) return
    setBusy(true)
    try {
      const result = await mutateAsync({
        url: endpoints.adminBoxOfficeLink(koficMovieCd),
        method: 'post',
        values: { movieId },
        successNotification: false,
        errorNotification: false,
      })
      message.success(`${result.data.linkedRecords ?? 0}건의 박스오피스 기록을 연결했습니다.`)
      reset()
      onLinked(result.data)
    } catch (e) {
      message.error(linkErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  // TMDB 후보는 우리 DB에 없는 영화 — 먼저 등록(온디맨드 동기화)한 뒤 그 movieId로 잇는다
  const registerAndLink = (s: MovieSearchSuggestion) =>
    modal.confirm({
      title: `"${s.title}"을(를) 등록하고 연결할까요?`,
      content: '우리 DB에 없는 영화라 TMDB에서 받아 등록한 뒤 이 박스오피스 코드에 연결합니다.',
      okText: '등록 후 연결',
      cancelText: '취소',
      onOk: async () => {
        let movieId: number | undefined
        try {
          const registered = await api.post<{ movieId?: number }>('/api/movies/sync', { tmdbId: s.tmdbId })
          movieId = registered.movieId
        } catch (e) {
          message.error(e instanceof ApiError ? e.message : '영화 등록에 실패했습니다.')
          return
        }
        if (movieId == null) {
          message.error('영화 등록 응답에 ID가 없습니다.')
          return
        }
        await link(movieId)
      },
    })

  return (
    <Modal open={!!koficMovieCd} title="영화 연결" onCancel={close} footer={null} width={640} destroyOnHidden>
      <Typography.Paragraph type="secondary">
        KOFIC 코드 <Typography.Text code>{koficMovieCd}</Typography.Text>
        {boxOfficeTitle ? ` · "${boxOfficeTitle}"` : ''} 에 연결할 영화를 찾습니다. 같은 코드의 모든 날짜 기록이 한 번에 연결됩니다.
      </Typography.Paragraph>
      <Input.Search
        autoFocus
        allowClear
        enterButton="검색"
        placeholder="제목 또는 원제"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onSearch={search}
        loading={loading}
      />
      <Spin spinning={loading || busy}>
        <div style={{ marginTop: 16, minHeight: 80 }}>
          {movies && (
            <List
              size="small"
              locale={{ emptyText: <Empty description="우리 DB에 검색 결과가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              dataSource={movies}
              renderItem={(m) => (
                <List.Item
                  actions={[
                    <Button key="link" type="primary" size="small" onClick={() => m.movieId != null && link(m.movieId)}>
                      연결
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Poster path={m.posterPath} />}
                    title={m.titleKo ?? m.title}
                    description={`${m.releaseDate ?? '개봉일 미정'} · 영화 #${m.movieId}${m.koficMovieCd ? ` · KOFIC ${m.koficMovieCd}` : ''}`}
                  />
                </List.Item>
              )}
            />
          )}
          {movies && suggestions === null && (
            <Button style={{ marginTop: 8 }} onClick={searchTmdb}>
              TMDB에서 찾기
            </Button>
          )}
          {suggestions && (
            <List
              header={<Typography.Text strong>TMDB 검색 결과 (아직 등록되지 않은 영화)</Typography.Text>}
              size="small"
              locale={{ emptyText: <Empty description="TMDB에도 결과가 없습니다." image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
              dataSource={suggestions}
              renderItem={(s) => (
                <List.Item
                  actions={[
                    <Button key="reg" size="small" onClick={() => registerAndLink(s)}>
                      등록 후 연결
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Poster path={s.posterPath} />}
                    title={s.title}
                    description={`${s.releaseDate ?? '개봉일 미정'} · TMDB ${s.tmdbId}`}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Spin>
    </Modal>
  )
}

function Poster({ path }: { path?: string }) {
  const url = tmdbImageUrl(path, PosterSize.THUMB)
  return url ? (
    <Image src={url} width={36} preview={false} alt="" />
  ) : (
    <div style={{ width: 36, height: 54, background: 'rgba(128,128,128,.2)', borderRadius: 4 }} />
  )
}
