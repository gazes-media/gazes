import animeController from '@controllers/animeController'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const { fetch } = new Hono()
  .route('/animes', animeController)

const port = Number.parseInt(process.env.PORT!)
serve({ port, fetch }, () => console.log('Listening on port', port))
