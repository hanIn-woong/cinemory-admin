import { List, useTable } from '@refinedev/antd'
import { Input, Select, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { Link } from 'react-router'
import type { AdminUserSummary } from '../../api/types'
import { USER_SORTS } from '../../api/types'
import { signupPathTags } from './signupTags'

export function UserList() {
  const { tableProps, setFilters } = useTable<AdminUserSummary>({
    resource: 'users',
    syncWithLocation: true,
    pagination: { pageSize: 20 },
    filters: { initial: [{ field: 'sort', operator: 'eq', value: 'CREATED_AT_DESC' }], mode: 'server' },
  })

  return (
    <List>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          allowClear
          placeholder="이메일 또는 닉네임 검색"
          style={{ width: 280 }}
          onSearch={(value) => setFilters([{ field: 'q', operator: 'eq', value: value.trim() }], 'merge')}
        />
        <Select
          defaultValue="CREATED_AT_DESC"
          style={{ width: 160 }}
          options={USER_SORTS.map((s) => ({ value: s.value, label: s.label }))}
          onChange={(value) => setFilters([{ field: 'sort', operator: 'eq', value }], 'merge')}
        />
      </Space>
      <Table<AdminUserSummary> {...tableProps} rowKey="userId" scroll={{ x: 'max-content' }}>
        <Table.Column dataIndex="userId" title="ID" width={70} />
        <Table.Column<AdminUserSummary>
          dataIndex="nickname"
          title="닉네임"
          render={(nickname, row) => <Link to={`/users/show/${row.userId}`}>{nickname}</Link>}
        />
        <Table.Column dataIndex="email" title="이메일" />
        <Table.Column<AdminUserSummary> title="가입 경로" render={(_, row) => signupPathTags(row)} />
        <Table.Column<AdminUserSummary>
          dataIndex="role"
          title="권한"
          render={(role) => <Tag color={role === 'ADMIN' ? 'red' : 'default'}>{role}</Tag>}
        />
        <Table.Column dataIndex="createdAt" title="가입일" render={(v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-')} />
      </Table>
    </List>
  )
}
