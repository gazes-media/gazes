import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { type RedisClientType, createClient } from "redis";
import { app } from "./app/app";
import { getEnv } from "./config";

export interface AppOptions {
	prismaClient: PrismaClient;
	redisClient: RedisClientType;
}

async function main() {
	const prismaClient = new PrismaClient();
	const redisClient = await connectToRedis();

	const port = Number(getEnv("PORT"));
	const host = getEnv("HOST");

	fastify({ logger: true })
		.register((fastify, opts) => app(fastify, { prismaClient, redisClient, ...opts } as AppOptions))
		.listen({ port, host }, (error, address) => {
			if (error) {
				console.error(error);
				process.exit(1);
			}

			console.info(`Server listening at ${address}`);
		});
}

async function connectToRedis() {
	try {
		const redisClient = await createClient().connect();

		if (process.env.NODE_ENV === "development") {
			await redisClient.flushDb();
			console.info("Redis DB flushed in development environment");
		}

		return redisClient;
	} catch (error) {
		throw new Error(`Failed to connect tp Redis: ${error.message}`);
	}
}

main().catch((error) => {
	console.error("An error occurred", error.message);
	process.exit(1);
});
