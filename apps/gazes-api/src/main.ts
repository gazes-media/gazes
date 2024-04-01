import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { type RedisClientType, createClient } from "redis";
import { app } from "./app/app";
import { getEnv } from "./config";
import { fetchType } from "./app/utils/fetchUtils";
import { Latest } from "./contracts/animesContract";
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'


export interface AppOptions {
	prismaClient: PrismaClient;
	redisClient: RedisClientType;
}

async function main() {
	const prismaClient = new PrismaClient();
	const redisClient = await connectToRedis();

	updateAnimeDatabase(prismaClient);
	setInterval(() => updateAnimeDatabase(prismaClient), 3600000);

	const port = Number(getEnv("PORT"));
	const host = getEnv("HOST");

	fastify({ logger: true })
		.withTypeProvider<TypeBoxTypeProvider>()
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

async function updateAnimeDatabase(prisma: PrismaClient) {
	// Fetch the list of animes
	const animeList = await fetchType(getEnv("NEKO_JSON_URL"), "json");
	if (!Array.isArray(animeList)) throw new Error("Failed to fetch or parse anime list.");

	// Prepare anime data and update the database
	const animeData = animeList.map((anime) => ({
		...anime,
		nb_eps: Number.parseInt(anime.nb_eps.split(" ")[0]),
	}));

	await prisma.anime.createMany({
		data: animeData,
		skipDuplicates: true,
	});

	// Fetch the latest episodes data
	const latestEpisodesData = await fetchType<string>(getEnv("NEKO_URL"), "text");
	const parsedLatestEpisodeData = latestEpisodesData.match(/var lastEpisodes = (.+)\;/)?.[1];
	if (!parsedLatestEpisodeData) throw new Error("Failed to fetch or parse latest episode data.");

	const latestEpisodes: Latest[] = JSON.parse(parsedLatestEpisodeData);

	// Prepare latest episodes data and update the database
	await prisma.latest.createMany({
		data: latestEpisodes.map((episode) => ({
			timestamp: (episode.timestamp * 1000).toString(),
			episode: episode.episode,
			lang: episode.lang,
			anime_url: episode.url,
			anime_id: Number.parseInt(episode.anime_url.match(/\/(\d+)/i)?.[1]),
		})),
		skipDuplicates: true,
	});
}


main().catch((error) => {
	console.error("An error occurred", error.message);
	process.exit(1);
});
