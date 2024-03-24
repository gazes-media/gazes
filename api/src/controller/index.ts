import Elysia from 'elysia'
import animeController from './animeController'

const router = new Elysia()
export default router

router.use(animeController)
