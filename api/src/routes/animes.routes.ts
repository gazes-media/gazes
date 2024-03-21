import Elysia, { t } from "elysia"
import Pino from "pino"
import { filterAnimes } from "../controllers/animes.controllers"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/:page",
        ({ logger, params, query }) => {
            const page = params.page || 1
            const { title, genres, start_date_year } = query

            const animes = filterAnimes({
                title,
                genres: genres && genres.trim() !== "" ? genres.split(",") : undefined,
                start_date_year: start_date_year,
            })

            return animes.slice(page * 25 - 25, page * 25)
        },
        {
            params: t.Object({
                page: t.Numeric(),
            }),

            query: t.Object({
                title: t.Optional(t.String()),
                genres: t.Optional(t.String()),
                start_date_year: t.Optional(t.Numeric()),
            }),
        },
    )

    return a
}
