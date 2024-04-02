import { Glob } from "bun"
import fastify from "fastify"
import {join} from "node:path"

export const app = fastify({
    logger: true,
    disableRequestLogging: true,
})

export type RouteOptions = {
    prismaClient: unknown;
    redisClient: unknown;
}

for await (const file of new Glob("**/*.router.*").scan(import.meta.dir)) {
    app.register((await import(join(import.meta.dir, file))).default)
}