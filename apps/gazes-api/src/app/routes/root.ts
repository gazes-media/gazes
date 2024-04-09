import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
	fastify.get("/", async () => ({ message: "Hello API" }));
}
