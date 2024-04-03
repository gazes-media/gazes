import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Glob } from "bun";
import fastify from "fastify";
import { join } from "node:path";
import { createClient, type RedisClientType } from "redis";
import { AnimeService } from "./services/animeService";
import { PrismaClient } from "prisma/prisma-client";

// Initialize a Fastify application instance with specific configurations.
export const app = fastify({
	logger: true, // Enable loggin for the application
	disableRequestLogging: true, // Disable request logging to avoid clutter in the log output
}).withTypeProvider<TypeBoxTypeProvider>();

// Synamically import and register router modules found by globbing thep roject directory for files
// with a ".router." in their names.
for await (const file of new Glob("**/*Router.*").scan(import.meta.dir)) {
	const prismaClient = new PrismaClient();
	const redisClient = (await createClient().connect()) as RedisClientType;

	const animeService = new AnimeService(redisClient, prismaClient)
	await animeService.updateDatabase()

	// Register each found router module with the Fastify application.
	// The router modules are expected to export a default function that defines routes.
	app.register((await import(join(import.meta.dir, file))).default, {
		prismaClient,
		redisClient,
	});
}
