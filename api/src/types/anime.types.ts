import { t } from "elysia"

export const NekoAnime = t.Object({
    id: t.Number(),
    title: t.String(),
    title_english: t.String(),
    title_romanji: t.String(),
    title_french: t.Optional(t.String()),
    others: t.String(),
    type: t.String(),
    status: t.String(),
    popularity: t.Number(),
    url: t.String(),
    genres: t.Array(t.String()),
    url_image: t.String(),
    score: t.String(),
    start_date_year: t.String(),
    nb_eps: t.String(),
})

export type NekoAnime = (typeof NekoAnime)["static"]

export const Anime = t.Object({
    id: t.Number(),
    title_english: t.String(),
    title_romanji: t.String(),
    title_french: t.Optional(t.String()),
    type: t.String(),
    status: t.Union([t.Literal("en cours"), t.Literal("terminé")]),
    popularity: t.Number(),
    genres: t.Array(t.String()),
    url_image: t.String(),
    score: t.String(),
    start_date_year: t.Number(),
    nb_eps: t.Number(),
})

export type Anime = (typeof Anime)["static"]

export function isAnime(anime: any): anime is Anime {
    if (
        typeof anime === "object" &&
        anime !== null &&
        typeof anime.id === "number" &&
        typeof anime.title_english === "string" &&
        typeof anime.title_romanji === "string" &&
        (typeof anime.title_french === "string" || anime.title_french === null) &&
        typeof anime.type === "string" &&
        typeof anime.popularity === "number" &&
        typeof anime.url === "string" &&
        Array.isArray(anime.genres) &&
        typeof anime.url_image === "string" &&
        typeof anime.score === "string" &&
        typeof anime.start_date_year === "number" &&
        typeof anime.nb_eps === "number" &&
        (anime.status === "en cours" || anime.status === "terminé") &&
        typeof anime.vf === "boolean"
    ) {
        return true
    }
    return false
}

export function transformNekoAnimeToAnime(nekoAnime: NekoAnime): Anime {
    return {
        id: nekoAnime.id,
        title_english: nekoAnime.title_english,
        title_romanji: nekoAnime.title_romanji,
        type: nekoAnime.type,
        popularity: nekoAnime.popularity,
        genres: nekoAnime.genres,
        url_image: nekoAnime.url_image,
        score: nekoAnime.score,
        nb_eps: parseInt(nekoAnime.nb_eps),
        start_date_year: parseInt(nekoAnime.start_date_year),
        status: nekoAnime.status === "1" ? "en cours" : "terminé",
    }
}
