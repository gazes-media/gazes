export type NekoAnime = {
    id: number
    title: string
    title_english: string
    title_romanji: string
    title_french: string | null
    others: string
    type: string
    status: string
    popularity: number
    url: string
    genres: string[]
    url_image: string
    score: string
    start_date_year: string
    nb_eps: string
}

export type Anime = Omit<
    NekoAnime,
    "title" | "title_french" | "url" | "others" | "nb_eps" | "start_date_year" | "status"
> & {
    nb_eps: number
    start_date_year: number
    status: "en cours" | "terminé"
    vf: boolean
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
        vf: nekoAnime.title_french !== null,
    }
}
