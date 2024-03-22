import Elysia from 'elysia'
import { refreshAnimeCache } from './cache/animeCache'
import controller from './controller'
import { logger } from './logger'

const PORT = Bun.env.PORT!

const app = new Elysia().use(controller)

await refreshAnimeCache()
app.listen(PORT)

logger.info('server running on port ' + PORT)
