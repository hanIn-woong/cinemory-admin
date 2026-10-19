import { useLogin } from '@refinedev/core'
import { Button, Card, Form, Input, Typography } from 'antd'
import { Wordmark } from '../components/Wordmark'

interface LoginForm {
  email: string
  password: string
}

// 이메일·비밀번호만. 실패 메시지는 서버 message 그대로(authProvider.login이 error.message로 돌려준다).
export function LoginPage() {
  const { mutate: login, isPending } = useLogin<LoginForm>()

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 16 }}>
      <Card style={{ width: 360 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Wordmark height={44} />
          <Typography.Text type="secondary" style={{ letterSpacing: 2, fontWeight: 600 }}>
            관리자
          </Typography.Text>
        </div>
        <Form<LoginForm> layout="vertical" onFinish={(values) => login(values)} requiredMark={false}>
          <Form.Item label="이메일" name="email" rules={[{ required: true, type: 'email', message: '이메일을 입력해 주세요.' }]}>
            <Input autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력해 주세요.' }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>
            로그인
          </Button>
        </Form>
      </Card>
    </div>
  )
}
