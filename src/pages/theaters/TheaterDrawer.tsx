import { useInvalidate } from '@refinedev/core'
import { Alert, Descriptions, Drawer, Tag, Typography } from 'antd'
import { endpoints } from '../../api/endpoints'
import type { AdminTheater } from '../../api/types'
import { KoEditor } from '../../components/KoEditor'

// 극장 상세(admin-spec 15-2 · 19-4) — 원본 이름 / 표시 이름 / 이름 덮어쓰기, 예매 링크 입력.
// 저장 응답(AdminTheaterResponse)으로 화면을 바로 갱신하고, 목록·감사 로그는 다시 받게 한다.
export function TheaterDrawer({
  theater,
  onClose,
  onChanged,
}: {
  theater: AdminTheater | null
  onClose: () => void
  onChanged: (saved: AdminTheater) => void
}) {
  const invalidate = useInvalidate()
  const saved = async (next: AdminTheater) => {
    onChanged(next)
    await invalidate({ resource: 'audit-logs', invalidates: ['list'] })
    await invalidate({ resource: 'theaters', invalidates: ['list'] })
  }
  const chain = theater?.chainName
  const hasChainDefault = !!chain && chain !== '기타'

  return (
    <Drawer open={!!theater} onClose={onClose} width={560} title={theater?.name ?? '극장'} destroyOnHidden>
      {theater && (
        <>
          <Descriptions bordered size="small" column={1} style={{ marginBottom: 24 }}>
            <Descriptions.Item label="극장 ID">{theater.theaterId}</Descriptions.Item>
            <Descriptions.Item label="체인">{chain ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="원본 이름">{theater.sourceName ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="표시 이름">
              {theater.name}
              {theater.nameOverride && (
                <Tag color="cyan" style={{ marginLeft: 8 }}>
                  덮어씀
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="주소">{theater.address ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="관 수">{theater.screenCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="상태">{theater.closedAt ? <Tag color="red">폐업(숨김)</Tag> : '운영 중'}</Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5}>이름 덮어쓰기</Typography.Title>
          <Typography.Paragraph type="secondary">
            체인 표기 규칙으로 정리되지 않는 예외만 직접 지정합니다. 지정한 이름은 매주 동기화 뒤에도 유지되고, 비우고 저장하면 규칙 이름으로 돌아갑니다.
          </Typography.Paragraph>
          <KoEditor<AdminTheater>
            key={`name:${theater.theaterId}:${theater.nameOverride ?? ''}`}
            url={endpoints.adminTheaterName(theater.theaterId ?? 0)}
            field="name"
            resultField="nameOverride"
            value={theater.nameOverride}
            placeholder="덮어쓸 이름 (비우면 규칙 이름)"
            savedMessage="극장 이름을 덮어썼습니다."
            clearedMessage="덮어쓰기를 해제했습니다."
            maxLength={100}
            width={500}
            onSaved={saved}
          />

          <Typography.Title level={5} style={{ marginTop: 32 }}>
            예매 링크
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            https:// 로 시작하고 공백 없이 500자 이내여야 합니다.
            {hasChainDefault ? ` 비워 두면 ${chain} 기본 링크가 쓰입니다.` : ' 독립영화관은 공공데이터에 링크가 없어 직접 입력합니다.'}
          </Typography.Paragraph>
          <KoEditor<AdminTheater>
            key={`url:${theater.theaterId}:${theater.bookingUrl ?? ''}`}
            url={endpoints.adminTheaterBookingUrl(theater.theaterId ?? 0)}
            field="bookingUrl"
            clearAsNull
            value={theater.bookingUrl}
            placeholder="https://… (비우면 삭제)"
            savedMessage="예매 링크를 저장했습니다."
            clearedMessage="예매 링크를 삭제했습니다."
            maxLength={500}
            width={500}
            onSaved={saved}
          />
          {theater.closedAt && theater.bookingUrl && (
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
              message="숨겨진 극장에 예매 링크가 남아 있습니다."
              description="주소 변경으로 새 극장이 생겼다면 링크를 새 극장에 옮겨 주세요."
            />
          )}
        </>
      )}
    </Drawer>
  )
}
