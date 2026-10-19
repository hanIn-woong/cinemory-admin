import { useCustomMutation } from '@refinedev/core'
import { App, Button, Input, Space } from 'antd'
import { useState } from 'react'
import { ApiError } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import type { AdminPersonSummary } from '../../api/types'

// 인물 한글명 인라인 편집(admin-spec 12-4) — 입력칸 + 저장. 저장하면 그 행만 응답으로 갱신한다(목록 다시 받기 없음).
// 빈 칸으로 저장하면 해제(null). 값이 바뀌지 않았으면 저장 버튼이 꺼져 있다(서버도 같은 값이면 무기록 200).
export function NameKoEditor({
  personId,
  nameKo,
  onSaved,
}: {
  personId: number
  nameKo: string | undefined
  onSaved?: (person: AdminPersonSummary) => void
}) {
  const { message } = App.useApp()
  const { mutateAsync, mutation } = useCustomMutation<AdminPersonSummary>()
  // 서버가 확정한 값(저장 직후 응답으로 갱신) — 입력 중인 값과 비교해 변경 여부를 본다
  const [saved, setSaved] = useState(nameKo ?? '')
  const [draft, setDraft] = useState(nameKo ?? '')

  const dirty = draft.trim() !== saved
  const save = async () => {
    try {
      const result = await mutateAsync({
        url: endpoints.adminPersonNameKo(personId),
        method: 'patch',
        values: { nameKo: draft },
        successNotification: false,
        errorNotification: false,
      })
      const next = result.data.nameKo ?? ''
      setSaved(next)
      setDraft(next)
      message.success(next ? '한글명을 저장했습니다.' : '한글명을 해제했습니다.')
      onSaved?.(result.data)
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.')
    }
  }

  return (
    <Space.Compact style={{ width: 260 }}>
      <Input
        value={draft}
        maxLength={100}
        placeholder="한글명 (비우면 해제)"
        onChange={(e) => setDraft(e.target.value)}
        onPressEnter={() => dirty && save()}
      />
      <Button type="primary" disabled={!dirty} loading={mutation.isPending} onClick={save}>
        저장
      </Button>
    </Space.Compact>
  )
}
