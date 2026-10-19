import { Image } from 'antd'
import { ProfileSize, tmdbImageUrl } from '../../constants/tmdb'

// 인물 사진 썸네일 — 없으면 자리 표시. (사진 크기 w92는 TMDB 이미지 크기 표준값)
export function PersonPhoto({ profilePath }: { profilePath: string | undefined }) {
  const url = tmdbImageUrl(profilePath, ProfileSize.THUMB)
  return url ? (
    <Image src={url} width={40} preview={false} alt="" style={{ borderRadius: 6 }} />
  ) : (
    <div style={{ width: 40, height: 60, background: 'rgba(128,128,128,.2)', borderRadius: 6 }} />
  )
}
