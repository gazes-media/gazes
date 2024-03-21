import Fuse from "fuse.js"
import { cachedAnimes, getCachedFuse } from "../cache"
import { transformNekoAnimeToAnime } from "../types/anime.types"

export function filterAnimes({
    title,
    genres,
    start_date_year,
}: {
    title?: string
    genres?: string[]
    start_date_year?: number
}) {
    let animes = cachedAnimes

    /* filter the animes by title */
    if (title && title.trim() !== "") {
        animes = getCachedFuse()
            .search(title)
            .map((a) => a.item)
    }

    /* filter the animes by genres */
    if (genres) {
        animes = animes.filter((anime) => genres.every((genre) => anime.genres.includes(genre)))
    }

    /* TODO filter anime by start date year */
    if (start_date_year) {
        animes = animes.filter((anime) => anime.start_date_year == start_date_year.toString())
    }

    /* TODO return real animes in the correct Anime type */
    return animes.map((anime) => transformNekoAnimeToAnime(anime))
}
