import Elysia, { t } from 'elysia'
import { filterAnimeList, getAnimeById, getEpisode, getEpisodeVideo } from '../service/animeService'
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

router.get(
  '/animes/:id',
  ({ params, error }) => {
    const retrievedAnime = getAnimeById(params.id)
    if (!retrievedAnime) return error(404, 'Not Found')

    return retrievedAnime
  },
  {
    params: t.Object({
      id: t.Numeric(),
    }),
  },
)

router.get(
  '/animes/:id/:episode',
  async ({ params, error }) => {
    const retrievedAnime = await getAnimeById(params.id)
    if (!retrievedAnime) return error(404, 'Anime Not Found')

    const retrievedEpisode = getEpisode(retrievedAnime, params.episode)
    if (!retrievedEpisode) return error(404, 'Episode Not Found')

    const retrievedEpisodeVideo = await getEpisodeVideo(retrievedEpisode.url)
    if (!retrievedEpisodeVideo) return error(404, 'Episode Video Not Found')

    return {
      anime: retrievedAnime,
      episode: { ...retrievedEpisode, video_url: retrievedEpisodeVideo },
    }
  },
  {
    params: t.Object({
      id: t.Numeric(),
      episode: t.Numeric(),
    }),
  },
)
