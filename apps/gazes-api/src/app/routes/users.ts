import type { FastifyInstance } from "fastify";
import type { AppOptions } from "@api/main";

export default async function (fastify: FastifyInstance, { redisClient, prismaClient }: AppOptions) {
	// TODO
}
