import Fuse from "fuse.js"
import { cachedAnimes, getCachedFuse } from "../cache";

export function filterAnimes({title, genres}: {title?: string, genres?: string[]}) {
    let animes = cachedAnimes

    /* filter the animes by title */
    if (title && title.trim() !== "") {
        animes = getCachedFuse().search(title).map(a => a.item)
    }

    /* filter the animes by genres */
    if (genres) {
        animes = animes.filter(anime => {
            return genres.every(genre => anime.genres.includes(genre));
        })
    }

    /* TODO filter anime by start date year */
    /* TODO return real animes in the correct Anime type */

    return animes
}