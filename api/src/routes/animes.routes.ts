import Elysia, { t } from "elysia"
import { cachedAnimes } from "../cache"
import Pino from "pino"
import Fuse from "fuse.js"

export default function (app: Elysia<"/animes">) {
    const a = app.decorate("logger", Pino())
    let fuse: Fuse<any>|null = null

    /* Retrieve a list of 25 animes using pagination */
    a.get(
        "/:page",
        ({ logger, params, query }) => {
            const page = params.page || 1
            const { title, genres } = query
            
            // TODO filter animes by title query
            let tempAnimes = cachedAnimes
            
            if (title && title.trim() !== "") {
                if (!fuse) fuse = new Fuse(cachedAnimes, {
                    includeScore: false,
                    keys: ["title", "title_english", "title_romanji", "title_french", "others"],
                })

                tempAnimes = fuse.search(title).map(a => a.item)
            }

            // TODO filter animes by genres (separated by commas)
            if (genres && genres.trim() !== "") {
                const splitedGenres = genres.split(",")
                tempAnimes = tempAnimes.filter(anime => {
                    return splitedGenres.every(genre => anime.genres.includes(genre));
                })
            }

            // TODO filter animes by start year

            return tempAnimes.slice(page * 25 - 25, page * 25)
        },
        {
            params: t.Object({
                page: t.Numeric(),
            }),

            query: t.Object({
                title: t.Optional(t.String()),
                genres: t.Optional(t.String())
            }),
        },
    )

    return a
}
