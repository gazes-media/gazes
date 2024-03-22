import { logger } from '../logger'
import type { NekosamaAnime } from '../type/anime.type'

const NEKOSAMA_JSON_URL = 'https://neko.ketsuna.com/animes-search-vostfr.json'

export let animeCache: NekosamaAnime[] = []

async function fillAnimeCache() {
  animeCache = (await fetch(NEKOSAMA_JSON_URL).then(res => res.json())) as NekosamaAnime[]
  logger.info('anime cache refreshed')
}
