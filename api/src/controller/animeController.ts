import Elysia from 'elysia'

const router = new Elysia()
export default router

router.get('/animes', () => {
  return 'hello world'
})
