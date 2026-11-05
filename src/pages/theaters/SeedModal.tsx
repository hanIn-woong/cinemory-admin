import { useCustomMutation, useInvalidate } from '@refinedev/core'
import { Alert, App, Button, Descriptions, Modal, Space, Table, Typography } from 'antd'
import { useState } from 'react'
import { ApiError } from '../../api/client'
import { endpoints } from '../../api/endpoints'
import type { TheaterSeedReport } from '../../api/types'

const n = (v: number | undefined) => (v ?? 0).toLocaleString('ko-KR')

// 극장 동기화(admin-spec 15-2 · 19-4) — 먼저 dryRun으로 보고서를 보여 준 뒤 실행한다.
// 확인 대상: 이름이 바뀔 극장(renamed — 규칙 변경 반영), 대량 폐업 의심(massCloseHeld), 예매 링크가 있는데 숨겨진 극장.
export function SeedModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { message, modal } = App.useApp()
  const { mutateAsync, mutation } = useCustomMutation<TheaterSeedReport>()
  const invalidate = useInvalidate()
  const [report, setReport] = useState<TheaterSeedReport | null>(null)
  // 마지막으로 돌린 것이 실행(dryRun=false)이면 그 결과다
  const [executed, setExecuted] = useState(false)

  const run = async (dryRun: boolean, allowMassClose = false) => {
    try {
      const result = await mutateAsync({
        url: `${endpoints.adminTheatersSeed}?dryRun=${dryRun}&allowMassClose=${allowMassClose}`,
        method: 'post',
        values: {},
        successNotification: false,
        errorNotification: false,
      })
      setReport(result.data)
      setExecuted(!dryRun)
      if (!dryRun) {
        await invalidate({ resource: 'audit-logs', invalidates: ['list'] })
        if (result.data.aborted) message.warning('수신이 불완전해 아무것도 반영하지 않았습니다.')
        else {
          message.success('극장 동기화를 실행했습니다.')
          onDone()
        }
      }
    } catch (e) {
      message.error(e instanceof ApiError ? e.message : '극장 동기화에 실패했습니다.')
    }
  }

  const close = () => {
    setReport(null)
    setExecuted(false)
    onClose()
  }

  const confirmRun = (allowMassClose: boolean) =>
    modal.confirm({
      title: allowMassClose ? '대량 폐업을 허용하고 실행할까요?' : '극장 동기화를 실행할까요?',
      content: allowMassClose
        ? '많은 극장이 한꺼번에 숨겨집니다. 보고서의 숨김 대상을 확인했다면 진행하세요.'
        : '보고서 내용이 실제로 반영됩니다. 이름 규칙이 바뀐 극장은 표시 이름이 함께 바뀝니다.',
      okText: '실행',
      cancelText: '취소',
      onOk: () => run(false, allowMassClose),
    })

  const held = report?.massCloseHeld ?? 0
  const canExecute = !!report && !executed && !report.aborted

  return (
    <Modal open={open} title="극장 동기화" onCancel={close} width={760} destroyOnHidden footer={null}>
      <Typography.Paragraph type="secondary">
        공공데이터와 맞춥니다. 먼저 <b>미리보기(dryRun)</b>로 신규·숨김·복구·이름 변경을 확인한 뒤 실행하세요. 월요일 04시에는 자동으로도 돌아갑니다.
      </Typography.Paragraph>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" loading={mutation.isPending} onClick={() => run(true)}>
          미리보기 (dryRun)
        </Button>
        {canExecute && (
          <Button danger={held > 0} onClick={() => confirmRun(false)} loading={mutation.isPending}>
            실행
          </Button>
        )}
      </Space>

      {report && (
        <>
          <Alert
            type={executed ? 'success' : 'info'}
            showIcon
            style={{ marginBottom: 12 }}
            message={executed ? '실행 결과' : '미리보기 결과 — 아직 반영되지 않았습니다.'}
          />
          {report.aborted && (
            <Alert type="error" showIcon style={{ marginBottom: 12 }} message="수신이 불완전해 중단됐습니다." description={report.abortReason} />
          )}
          {held > 0 && (
            <Alert
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              message={`대량 폐업 의심 — ${n(held)}곳이 숨김 보류됐습니다.`}
              description="공공데이터 이상일 수 있습니다. 숨김 대상을 확인한 뒤에만 아래 버튼으로 허용 실행하세요."
              action={
                !executed && (
                  <Button size="small" danger onClick={() => confirmRun(true)}>
                    대량 폐업 허용 후 실행
                  </Button>
                )
              }
            />
          )}
          <Descriptions bordered size="small" column={{ xs: 1, md: 2 }} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="극장 수">{n(report.theaterCount)}</Descriptions.Item>
            <Descriptions.Item label="신규">{n(report.newTheaters)}</Descriptions.Item>
            <Descriptions.Item label="숨김(폐업)">{n(report.closedTheaters)}</Descriptions.Item>
            <Descriptions.Item label="복구">{n(report.reopenedTheaters)}</Descriptions.Item>
            <Descriptions.Item label="숨김 보류">{n(held)}</Descriptions.Item>
            <Descriptions.Item label="이름이 바뀔 극장">{n(report.renamed)}</Descriptions.Item>
          </Descriptions>

          {(report.renamedExamples ?? []).length > 0 && (
            <>
              <Typography.Title level={5}>이름 변경 예시 (앞 {report.renamedExamples?.length}건)</Typography.Title>
              <Table
                size="small"
                rowKey="sourceCode"
                pagination={false}
                dataSource={report.renamedExamples}
                columns={[
                  { title: '이전', dataIndex: 'before' },
                  { title: '변경 후', dataIndex: 'after' },
                ]}
                style={{ marginBottom: 16 }}
              />
            </>
          )}

          {(report.closedWithBookingUrl ?? []).length > 0 && (
            <>
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 8 }}
                message="예매 링크가 있는 극장이 숨겨졌습니다 — 관리자 확인 대상"
                description="주소 변경으로 옛 극장이 숨고 새 극장이 생긴 경우일 수 있습니다. 링크를 새 극장에 옮겨 주세요(자동 이전은 하지 않습니다)."
              />
              <Table
                size="small"
                rowKey="theaterId"
                pagination={false}
                dataSource={report.closedWithBookingUrl}
                columns={[
                  { title: '극장', dataIndex: 'name' },
                  { title: '예매 링크', dataIndex: 'bookingUrl', ellipsis: true },
                ]}
              />
            </>
          )}
        </>
      )}
    </Modal>
  )
}
