import type { FastifyInstance } from "fastify";

export default function (fastify: FastifyInstance) {
	fastify.get("/", async () => ({ message: "Hello API" }));
}
