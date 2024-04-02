import {app} from "@/app"

const FASTIFY_PORT = Number(Bun.env.PORT) || 3000;

app.listen({ port: FASTIFY_PORT });