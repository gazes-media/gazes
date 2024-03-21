import Elysia, { t } from "elysia"
import Pino from "pino"
import { filterAnimes } from "../controllers/animes.controllers"
import { Anime } from "../types/anime.types"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/animes",
        ({ query }) => {
            const { title, genres, start_date_year, page = 1 } = query

            const animes = filterAnimes({
                title,
                genres: genres?genres.split(","):undefined,
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
                200: t.Array(Anime)
            },

            detail: {
                description: "Return a list of 25 animes filtered by title, genres or start date year."
            }
        },
    )

    /* TODO Retrieve detailed information about an anime */

    return a
}
