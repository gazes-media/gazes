import { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
  fastify.get('/animes', async function () {
    return { message: 'Hello API' };
  });
}
