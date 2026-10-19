import type { ThemeConfig } from 'antd'

// 앱(cinemory-app/src/theme/tokens.ts)의 브랜드 색을 그대로 옮겼다 — 값을 바꿀 때는 앱과 같이 바꾼다.
export const brand = {
  primary: '#14D9D9', // 앱 primary — 버튼·선택 상태
  brandDeep: '#37BEB0',
  brandLight: '#DBF5F0',
  shadowDeep: '#1F7A72', // 흰/크림 바탕 위 텍스트 링크 — primary는 대비가 약 1.7:1이라 글자색으로 못 쓴다
  background: '#FDFBF7', // 크림 바탕
  foreground: '#252525',
  destructive: '#D4183D',
} as const

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brand.primary,
    colorLink: brand.shadowDeep,
    colorLinkHover: brand.brandDeep,
    colorLinkActive: brand.shadowDeep,
    // primary 버튼 글자색 — 시안 위에 흰 글자는 읽히지 않아 앱 foreground(어두운색)를 쓴다
    colorTextLightSolid: brand.foreground,
    colorText: brand.foreground,
    colorError: brand.destructive,
    colorBgLayout: brand.background,
    borderRadius: 8,
  },
  components: {
    Menu: {
      itemSelectedBg: brand.brandLight,
      itemSelectedColor: brand.shadowDeep,
    },
    Table: {
      headerBg: '#F4F1EA',
    },
  },
}
