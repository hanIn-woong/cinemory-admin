import { endpoints } from '../../api/endpoints'
import type { AdminMovieDetail } from '../../api/types'
import { KoEditor } from '../../components/KoEditor'

// 영화 한글 제목 편집(admin-spec 12-B-4) — 공통 KoEditor에 영화용 값만 채운다. 응답은 갱신된 영화 상세다.
export function TitleKoEditor({
  movieId,
  titleKo,
  onSaved,
}: {
  movieId: number
  titleKo: string | undefined
  onSaved?: (movie: AdminMovieDetail) => void
}) {
  return (
    <KoEditor<AdminMovieDetail>
      url={endpoints.adminMovieTitleKo(movieId)}
      field="titleKo"
      value={titleKo}
      placeholder="한글 제목 (비우면 해제)"
      savedMessage="한글 제목을 저장했습니다."
      clearedMessage="한글 제목을 해제했습니다."
      maxLength={255}
      width={420}
      onSaved={onSaved}
    />
  )
}
