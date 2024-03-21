import { startCache } from "./cache"
import { Elysia } from "elysia"
import animesRoutes from "./routes/animes.routes"

export const app = new Elysia().group("/animes", animesRoutes).listen(3000)

await startCache()

console.log(`api running on port ${app.server?.port}`)
