import { useCustom, useNavigation } from '@refinedev/core'
import { Alert, Card, Col, Row, Segmented, Space, Statistic, Table, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { Link } from 'react-router'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { endpoints } from '../../api/endpoints'
import type { AdminDashboard, AdminDashboardTopMovie } from '../../api/types'
import { Ellipsis } from '../../components/Ellipsis'
import { brand } from '../../theme/brand'
import { PosterSize, tmdbImageUrl } from '../../constants/tmdb'

const PERIODS = [
  { value: 7, label: '최근 7일' },
  { value: 30, label: '최근 30일' },
  { value: 90, label: '최근 90일' },
]

// 선 색 — 앱 브랜드 색(primary·brandDeep·shadowDeep)과 앱의 별 색. 크림 바탕에서 서로 구분되게 명도 차를 둔다.
const COLORS = { primary: brand.primary, deep: brand.shadowDeep, soft: brand.brandDeep, gold: '#E0A800' }

const num = (v: number | undefined) => (v ?? 0).toLocaleString('ko-KR')

// 대시보드(admin-spec 13-2) — 누적·최근 7일 KPI, 일별 추이 2개, 기록 TOP 10, 운영 알림. 읽기 전용이다.
export function DashboardPage() {
  const [days, setDays] = useState(30)
  const { query } = useCustom<AdminDashboard>({ url: `${endpoints.adminDashboard}?days=${days}`, method: 'get' })
  const data = query.data?.data
  const { show } = useNavigation()

  const totals = data?.totals
  const recent = data?.recent
  const daily = (data?.daily ?? []).map((d) => ({ ...d, label: dayjs(d.date).format('MM-DD') }))

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={3} style={{ margin: 0 }}>
          대시보드
        </Typography.Title>
        <Segmented options={PERIODS} value={days} onChange={(v) => setDays(Number(v))} />
      </Space>

      {query.isError && <Alert type="error" showIcon message="대시보드를 불러오지 못했습니다." style={{ marginBottom: 16 }} />}

      <Typography.Text type="secondary">누적</Typography.Text>
      <Row gutter={[16, 16]} style={{ margin: '8px 0 20px' }}>
        {(
          [
            ['사용자', totals?.users],
            ['영화', totals?.movies],
            ['시청 기록', totals?.watchRecords],
            ['리뷰', totals?.reviews],
          ] as const
        ).map(([label, value]) => (
          <Col key={label} xs={12} md={6}>
            <Card size="small" loading={query.isLoading}>
              <Statistic title={label} value={value ?? 0} formatter={(v) => num(Number(v))} />
            </Card>
          </Col>
        ))}
      </Row>

      <Typography.Text type="secondary">최근 7일</Typography.Text>
      <Row gutter={[16, 16]} style={{ margin: '8px 0 20px' }}>
        <Col xs={24} md={8}>
          <Card size="small" loading={query.isLoading}>
            <Statistic title="신규 가입" value={recent?.newUsers ?? 0} formatter={(v) => num(Number(v))} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" loading={query.isLoading}>
            <Statistic title="활성 사용자" value={recent?.activeUsers ?? 0} formatter={(v) => num(Number(v))} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              앱을 연 사용자(토큰 발급 기준)
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" loading={query.isLoading}>
            <Statistic title="신규 시청 기록" value={recent?.newWatchRecords ?? 0} formatter={(v) => num(Number(v))} />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {num(recent?.recordingUsers)}명이 기록
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card size="small" title={`사용자 추이 (최근 ${days}일)`} loading={query.isLoading}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newUsers" name="신규 가입" stroke={COLORS.deep} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="activeUsers" name="활성 사용자" stroke={COLORS.primary} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card size="small" title={`콘텐츠 추이 (최근 ${days}일)`} loading={query.isLoading}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={daily} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="newWatchRecords" name="시청 기록" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="newReviews" name="리뷰" stroke={COLORS.deep} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="newMovies" name="영화 등록" stroke={COLORS.gold} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card size="small" title={`가장 많이 기록된 영화 TOP 10 (최근 ${days}일)`} loading={query.isLoading}>
            <Table<AdminDashboardTopMovie>
              size="small"
              rowKey="movieId"
              pagination={false}
              dataSource={data?.topMovies}
              locale={{ emptyText: '이 기간에 기록된 영화가 없습니다.' }}
              onRow={(row) => ({ onClick: () => show('movies', row.movieId ?? 0), style: { cursor: 'pointer' } })}
            >
              <Table.Column title="#" width={48} render={(_, __, index) => index + 1} />
              <Table.Column<AdminDashboardTopMovie>
                title="포스터"
                width={64}
                render={(_, row) => {
                  const url = tmdbImageUrl(row.posterPath, PosterSize.THUMB)
                  return url ? (
                    <img src={url} alt="" width={32} style={{ borderRadius: 4, display: 'block' }} />
                  ) : (
                    <div style={{ width: 32, height: 48, background: 'rgba(128,128,128,.2)', borderRadius: 4 }} />
                  )
                }}
              />
              <Table.Column<AdminDashboardTopMovie>
                title="제목"
                render={(_, row) => (
                  <Ellipsis text={row.title ?? ''} maxWidth={360}>
                    <Link to={`/movies/show/${row.movieId}`} onClick={(e) => e.stopPropagation()}>
                      {row.title}
                    </Link>
                  </Ellipsis>
                )}
              />
              <Table.Column dataIndex="recordCount" title="기록 수" width={90} align="right" render={(v) => num(v)} />
            </Table>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card size="small" title="운영 알림" loading={query.isLoading}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                message={
                  <>
                    동기화 이력 없는 영화 <b>{num(totals?.moviesNeverSynced)}편</b>
                  </>
                }
                description={
                  <Link to="/movies?filters[0][field]=sort&filters[0][operator]=eq&filters[0][value]=SYNCED_AT_ASC">
                    오래 동기화 안 된 순으로 보기
                  </Link>
                }
              />
              <Alert
                type="info"
                showIcon
                message={
                  <>
                    한글 이름이 없는 인물 <b>{num(totals?.personsMissingKorean)}명</b>
                  </>
                }
                description={
                  <Link to="/persons?filters[0][field]=missingKorean&filters[0][operator]=eq&filters[0][value]=true">
                    한글명 없는 인물만 보기
                  </Link>
                }
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
