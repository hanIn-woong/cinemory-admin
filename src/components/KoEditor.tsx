import { useCustomMutation } from '@refinedev/core'
import { App, Button, Input, Space } from 'antd'
import { useState } from 'react'
import { ApiError } from '../api/client'

// 한글 이름·제목 인라인 편집의 공통 부분(admin-spec 12-4 · 12-B-4) — 입력칸 + 저장. PATCH 본문은 { [field]: 입력값 }.
// 서버가 확정한 값(공백 제거·해제)으로 입력칸을 되돌려 놓고, 값이 바뀌지 않았으면 저장 버튼이 꺼져 있다(서버도 같은 값이면 무기록 200).
// 비우고 저장하면 해제(null). 저장 후 그 행만 응답으로 갱신한다 — 호출부가 onSaved로 자기 상태를 바꾼다.
export function KoEditor<T extends Record<string, unknown>>({
  url,
  field,
  value,
  placeholder,
  savedMessage,
  clearedMessage,
  maxLength,
  width = 260,
  onSaved,
}: {
  url: string
  field: string
  value: string | undefined
  placeholder: string
  savedMessage: string
  clearedMessage: string
  maxLength: number
  width?: number
  onSaved?: (data: T) => void
}) {
  const { message } = App.useApp()
  const { mutateAsync, mutation } = useCustomMutation<T>()
  const [saved, setSaved] = useState(value ?? '')
  const [draft, setDraft] = useState(value ?? '')

  const dirty = draft.trim() !== saved
  const save = async () => {
    try {
      const result = await mutateAsync({
        url,
        method: 'patch',
        values: { [field]: draft },
        successNotification: false,
        errorNotification: false,
      })
      const next = (result.data[field] as string | null | undefined) ?? ''
      setSaved(next)
      setDraft(next)
      message.success(next ? savedMessage : clearedMessage)
      onSaved?.(result.data)
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.')
    }
  }

  return (
    <Space.Compact style={{ width }}>
      <Input
        value={draft}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onPressEnter={() => dirty && save()}
      />
      <Button type="primary" disabled={!dirty} loading={mutation.isPending} onClick={save}>
        저장
      </Button>
    </Space.Compact>
  )
}
