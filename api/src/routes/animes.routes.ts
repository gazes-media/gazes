import Elysia, { t } from "elysia"
import { cachedAnimes } from "../cache"
import Pino from "pino"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/:page",
        ({ logger, params }) => {
            const page = params.page || 1
            const animes = cachedAnimes.slice(page * 25 - 25, page * 25)

            logger.info(animes)
            return animes
        },
        {
            params: t.Object({
                page: t.Numeric(),
            }),
        },
    )

    return a
}
