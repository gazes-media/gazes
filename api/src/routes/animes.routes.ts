import Elysia, { t } from "elysia"
import Pino from "pino"
import { filterAnimes, getAnimeByID } from "../controllers/animes.controllers"
import { Anime, NekoAnime, transformNekoAnimeToAnime } from "../types/anime.types"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/animes",
        ({ query }) => {
            const { title, genres, start_date_year, page = 1 } = query

            const animes = filterAnimes({
                title,
                genres: genres ? genres.split(",") : undefined,
                start_date_year: start_date_year,
            })

            return animes.slice(page * 25 - 25, page * 25)
        },
        {
            query: t.Object({
                page: t.Optional(t.Numeric()),
                title: t.Optional(t.String()),
                genres: t.Optional(t.String()),
                start_date_year: t.Optional(t.Numeric()),
            }),

            response: {
                200: t.Array(Anime),
            },

            detail: {
                description: "Return a list of 25 animes filtered by title, genres or start date year.",
            },
        },
    )

    /* TODO Retrieve detailed information about an anime */
    a.get(
        "/animes/:id",
        async ({ params, error }) => {
            const retrievedAnime: NekoAnime|undefined = await getAnimeByID(params.id)

            if (retrievedAnime === undefined) {
                return error(404, {
                    error: "anime with the provided id not found",
                })
            }

            return transformNekoAnimeToAnime(retrievedAnime)
        },
        {
            params: t.Object({
                id: t.Numeric(),
            }),

            response: {
                200: Anime,
                404: t.Object({
                    error: t.Any(),
                }),
            },
        },
    )

    return a
}
