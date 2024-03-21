import Fuse from "fuse.js"
import { cachedAnimes, getCachedFuse } from "../cache"
import { Anime, transformNekoAnimeToAnime } from "../types/anime.types"

export async function getAnimeByID(id: number) {
    const retrievedAnime = cachedAnimes.find((a) => a.id == id)
    if (!retrievedAnime) return

    const response = await fetch(`https://neko.ketsuna.com/${retrievedAnime.url}`)
    const html = await response.text()

    const synopsis = /(<div class="synopsis">\n<p>\n)(.*)/gm.exec(html)?.[2]
    const cover_url = /(<div id="head" style="background-image: url\()(.*)(\);)/gm.exec(html)?.[2]
    const episodes = JSON.parse(/var episodes = (.+)\;/gm.exec(html)?.[1] as string)

    return { ...retrievedAnime, synopsis, cover_url, episodes }
}

/* Filters animes based on the provided criteria. */
export function filterAnimes({ title = "", genres = [], start_date_year }: { title?: string; genres?: string[]; start_date_year?: number }) {
    let animes = cachedAnimes

    if (title.trim() !== "") {
        animes = getCachedFuse()
            .search(title)
            .map((a) => a.item)
    }

    if (genres.length > 0 && genres.every((genre) => genre.trim().length > 0)) {
        animes = animes.filter((anime) => genres.every((genre) => anime.genres.includes(genre)))
    }

    if (start_date_year !== undefined) {
        animes = animes.filter((anime) => anime.start_date_year == start_date_year.toString())
    }

    return animes.map(transformNekoAnimeToAnime)
}
