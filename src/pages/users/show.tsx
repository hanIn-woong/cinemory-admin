import { Show } from '@refinedev/antd'
import { useShow } from '@refinedev/core'
import { Card, Col, Descriptions, Row, Statistic, Tag } from 'antd'
import dayjs from 'dayjs'
import { useParams } from 'react-router'
import type { AdminUserDetail } from '../../api/types'
import { signupPathTags } from './signupTags'

const fmt = (v?: string) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-')

export function UserShow() {
  const { id } = useParams()
  const { query } = useShow<AdminUserDetail>({ resource: 'users', id })
  const user = query.data?.data
  const activity = user?.activity

  const metrics: [string, number | undefined][] = [
    ['전체 회차', activity?.watchRecordCount],
    ['본 영화', activity?.watchedMovieCount],
    ['리뷰', activity?.reviewCount],
    ['찜', activity?.wishCount],
    ['컬렉션', activity?.collectionCount],
    ['팔로워', activity?.followerCount],
    ['팔로잉', activity?.followingCount],
  ]

  return (
    <Show isLoading={query.isLoading} canEdit={false} canDelete={false} title="회원 상세">
      {user && (
        <>
          <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="ID">{user.userId}</Descriptions.Item>
            <Descriptions.Item label="권한">
              <Tag color={user.role === 'ADMIN' ? 'red' : 'default'}>{user.role}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="닉네임">{user.nickname}</Descriptions.Item>
            <Descriptions.Item label="이메일">{user.email}</Descriptions.Item>
            <Descriptions.Item label="가입 경로">{signupPathTags(user)}</Descriptions.Item>
            <Descriptions.Item label="공개 범위">{user.privacySetting}</Descriptions.Item>
            <Descriptions.Item label="가입일">{fmt(user.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="수정일">{fmt(user.updatedAt)}</Descriptions.Item>
            <Descriptions.Item label="프로필 사진" span={2}>
              {user.profileImage ? <img src={user.profileImage} alt="" style={{ height: 64, borderRadius: 8 }} /> : '없음'}
            </Descriptions.Item>
          </Descriptions>

          <Row gutter={[16, 16]}>
            {metrics.map(([label, value]) => (
              <Col key={label} xs={12} md={6}>
                <Card size="small">
                  <Statistic title={label} value={value ?? 0} />
                </Card>
              </Col>
            ))}
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic title="마지막 관람일" value={activity?.lastWatchDate ?? '-'} />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Show>
  )
}
