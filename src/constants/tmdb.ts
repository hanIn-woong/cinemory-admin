const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const PosterSize = { THUMB: 'w92', DETAIL: 'w342' } as const

export function tmdbImageUrl(path: string | null | undefined, size: string): string | null {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export function tmdbMovieUrl(tmdbId: number): string {
  return `https://www.themoviedb.org/movie/${tmdbId}`
}
