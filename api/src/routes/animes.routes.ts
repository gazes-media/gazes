import Elysia, { t } from "elysia"
import { cachedAnimes } from "../cache"
import Pino from "pino"
import Fuse from "fuse.js"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/:page",
        ({ logger, params, query }) => {
            const page = params.page || 1
            const { title } = query
            
            let tempAnimes = cachedAnimes

            const fuse = new Fuse(cachedAnimes, {
                includeScore: false,
                keys: ["title", "title_english", "title_romanji", "title_french", "others"],
            })
            
            if (title && title.trim() !== "") {
                tempAnimes = fuse.search(title).map(a => a.item)
            }

            // TODO filter animes by genres (separated by commas)
            // TODO filter animes by start year

            return tempAnimes.slice(page * 25 - 25, page * 25)
        },
        {
            params: t.Object({
                page: t.Numeric(),
            }),

            query: t.Object({
                title: t.Optional(t.String()),
            }),
        },
    )

    return a
}
