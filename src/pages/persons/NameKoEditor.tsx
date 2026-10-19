import { endpoints } from '../../api/endpoints'
import type { AdminPersonSummary } from '../../api/types'
import { KoEditor } from '../../components/KoEditor'

// 인물 한글명 인라인 편집(admin-spec 12-4) — 공통 KoEditor에 인물용 값만 채운다.
export function NameKoEditor({
  personId,
  nameKo,
  onSaved,
}: {
  personId: number
  nameKo: string | undefined
  onSaved?: (person: AdminPersonSummary) => void
}) {
  return (
    <KoEditor<AdminPersonSummary>
      url={endpoints.adminPersonNameKo(personId)}
      field="nameKo"
      value={nameKo}
      placeholder="한글명 (비우면 해제)"
      savedMessage="한글명을 저장했습니다."
      clearedMessage="한글명을 해제했습니다."
      maxLength={100}
      onSaved={onSaved}
    />
  )
}
