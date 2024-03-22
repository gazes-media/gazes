import { animeCache } from '../cache/animeCache'
import { getFuse } from '../cache/fuseCache'
import type { NekosamaAnime } from '../type/animeType'

export function filterAnimeList(
  animeList: NekosamaAnime[],
  { title, genreList, releaseDate }: { title?: string; genreList?: string[]; releaseDate?: number } = {},
): NekosamaAnime[] {
  if (genreList && genreList.length > 0 && genreList.every(genre => genre.trim() !== '')) {
    animeList = animeList.filter(anime => genreList.every(genre => anime.genres.includes(genre)))
  }

  if (releaseDate) {
    animeList = animeList.filter(anime => anime.start_date_year === releaseDate.toString())
  }

  if (title && title.trim() !== '') {
    animeList = getFuse(animeList)
      .search(title)
      .map(anime => anime.item)
  }

  return animeList
}
