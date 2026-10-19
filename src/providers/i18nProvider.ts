import type { I18nProvider } from '@refinedev/core'

// Refine이 기본으로 영어를 쓰는 레이아웃 문구만 한국어로 바꾼다. 키가 없으면 Refine의 기본 문구를 그대로 쓴다.
const KO: Record<string, string> = {
  'buttons.logout': '로그아웃',
  'buttons.refresh': '새로고침',
  'actions.list': '목록',
  'actions.show': '상세',
  'pages.error.info': '페이지를 찾을 수 없습니다.',
  'pages.error.404': '요청하신 페이지가 없습니다.',
  'pages.error.backHome': '처음으로',
  'notifications.error': '오류가 발생했습니다.',
}

export const i18nProvider: I18nProvider = {
  translate: (key, _options, defaultMessage) => KO[key] ?? defaultMessage ?? key,
  changeLocale: async () => undefined,
  getLocale: () => 'ko',
}
