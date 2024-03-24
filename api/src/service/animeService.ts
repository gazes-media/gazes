import { animeCache } from '../cache/animeCache'
import { getFuse } from '../cache/fuseCache'
import type { DetailedNekosamaAnime, Episode, NekosamaAnime } from '../type/animeType'
import he from 'he'

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

export async function getAnimeById(id: number): Promise<DetailedNekosamaAnime | undefined> {
  const retrievedAnime = animeCache.find(a => a.id == id)
  if (!retrievedAnime) return

  const response = await fetch(`https://neko.ketsuna.com/${retrievedAnime.url}`)
  const html = await response.text()

  const synopsis = he.decode(/(<div class="synopsis">\n<p>\n)(.*)/gm.exec(html)?.[2] as string).replace(/<[^>]*>/g, '')
  const cover_url = /(<div id="head" style="background-image: url\()(.*)(\);)/gm.exec(html)?.[2] as string
  const episodes = JSON.parse(/var episodes = (.+)\;/gm.exec(html)?.[1] as string)

  return { ...retrievedAnime, synopsis, cover_url, episodes }
}

export function getEpisode(anime: DetailedNekosamaAnime, episodeNumber: number): Episode | undefined {
  const retrievedEpisode = anime.episodes.find(episode => episode.num == episodeNumber)
  if (!retrievedEpisode) return undefined

  return retrievedEpisode
}

const PROXY_URL = 'https://proxy.ketsuna.com?url='

export async function getEpisodeVideo(episodeUrl: string): Promise<string | undefined> {
  const proxiedEpisodeUrl = 'https://neko.ketsuna.com' + episodeUrl

  const episodeHtml = await fetch(proxiedEpisodeUrl).then(res => res.text())
  if (!episodeHtml) return undefined

  const playerUrl = episodeHtml.match(/video\[0\] = '([^']*)';/)?.[1]
  if (!playerUrl) return undefined

  const playerHtml = await fetch(PROXY_URL + encodeURIComponent(playerUrl)).then(res => res.text())
  if (!playerHtml || playerHtml === '') return undefined

  const scriptUrl = playerHtml.match(/src="(https?:\/\/[^"]*\/f\/u\/u[^"]*)"/)?.[1]
  if (!scriptUrl) return undefined

  const scriptJs = await fetch(PROXY_URL + encodeURIComponent(scriptUrl)).then(res => res.text())
  if (!scriptJs) return undefined

  const videoObjectEncoded = scriptJs.match(/atob\("([^"]+)"/)?.[1]
  if (!videoObjectEncoded) return undefined

  const videoObject = atob(videoObjectEncoded)
  const videoUrl = videoObject.match(/"ezofpjbzoiefhzofsdhvuzehfg"\s*:\s*"([^"]+)"/)?.[1]

  if (!videoUrl) return undefined

  return `${PROXY_URL}${encodeURIComponent(videoUrl.replaceAll('\\', ''))}`
}
