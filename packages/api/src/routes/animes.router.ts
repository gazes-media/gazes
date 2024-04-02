import type { RouteOptions } from "@/app"
import type { FastifyInstance } from "fastify"

export default async function(app: FastifyInstance, opts: RouteOptions) {
    app.get('/animes', (request, reply) => {
        reply.status(200).send({
            data: [{}]
        })
    })
}