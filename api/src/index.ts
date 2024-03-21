import { startCache } from "./cache"
import { Elysia } from "elysia"
import animesRoutes from "./routes/animes.routes"
import { swagger } from "@elysiajs/swagger"

export const app = new Elysia()
  .use(swagger())
  .use(animesRoutes)
  .listen(3000)

await startCache()

console.log(`api running on port ${app.server?.port}`)
