import { NekosamaAnime } from '../types/animeTypes'

let animeCache: NekosamaAnime[] = []

export async function loadCache() {
  const nekosamaJsonUrl = 'https://neko.ketsuna.com/animes-search-vostfr.json'
  animeCache = (await fetch(nekosamaJsonUrl).then(res => res.json())) as NekosamaAnime[]
}

export async function getAnimeCache() {
  if (animeCache.length < 0) await loadCache()
  return animeCache
}

const animes = await getAnimeCache()
console.log(animes)

const used = process.memoryUsage().heapUsed / 1024 / 1024
console.log(`The script is using approximately ${used} MB`)
