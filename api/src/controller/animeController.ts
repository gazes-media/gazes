import Elysia, { t } from 'elysia'
import { filterAnimeList } from '../service/animeService'
import { animeCache } from '../cache/animeCache'

const router = new Elysia()
export default router

router.get(
  '/animes',
  ({ query }) => {
    return filterAnimeList(animeCache, {
      title: query.title,
      releaseDate: query.releaseDate,
      genreList: query.genreList?.split(','),
    })
  },
  {
    query: t.Object({
      title: t.Optional(t.String()),
      genreList: t.Optional(t.String()),
      releaseDate: t.Optional(t.Numeric()),
    }),
  },
)
