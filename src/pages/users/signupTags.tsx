import { Tag } from 'antd'
import type { AdminUserSummary } from '../../api/types'

const PROVIDER_LABEL: Record<string, string> = { KAKAO: '카카오', GOOGLE: '구글' }

// 가입 경로 — 이메일(비밀번호 보유) + 연결된 소셜. 둘 다 가능하다(소셜 연결, S-6).
export function signupPathTags(user: Pick<AdminUserSummary, 'hasPassword' | 'socialProviders'>) {
  return (
    <>
      {user.hasPassword && <Tag>이메일</Tag>}
      {(user.socialProviders ?? []).map((p) => (
        <Tag key={p} color="gold">
          {PROVIDER_LABEL[p] ?? p}
        </Tag>
      ))}
    </>
  )
}
