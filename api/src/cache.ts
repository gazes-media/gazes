import { NekoAnime } from "./types/anime.types"

export let cachedAnimes: NekoAnime[] = []

async function getAllAnimes() {
    const response = await fetch("https://neko.ketsuna.com/animes-search-vostfr.json")
    const data = await response.json()

    cachedAnimes = data
}

export async function startCache() {
    await getAllAnimes()
    setInterval(getAllAnimes, 360000)
    
    console.info("cache refreshed")
}
