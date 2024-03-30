import { config } from "@api/config";
import type { Latest } from "@api/contracts/animesContract";
import type { AppOptions } from "@api/main";
import AutoLoad from "@fastify/autoload";
import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import * as path from "node:path";
import { fetchType } from "./utils/fetchUtils";

/**
 * Initializes the Fastify application with auto-loaded plugins and routes,
 * and periodically updates the anime database.
 *
 * @param {FastifyInstance} fastify - The Fastify instance to configure.
 * @param {AppOptions} opts - Options containing Prisma and Redis clients.
 */
export async function app(fastify: FastifyInstance, opts: AppOptions) {
	updateAnimeDatabase(opts.prisma);
	setInterval(() => updateAnimeDatabase(opts.prisma), 3600000);

	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "plugins"),
		options: { ...opts },
	});

	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "routes"),
		options: { ...opts },
	});
}

/**
 * Updates the anime database with the latest anime list and episodes from an external source.
 *
 * @param {PrismaClient} prisma - The Prisma client for database operations.
 */
async function updateAnimeDatabase(prisma: PrismaClient) {
	// Fetch the list of animes
	const animeList = await fetchType(config.NEKO_JSON_URL, "json");
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
	const latestEpisodesData = await fetchType<string>(config.NEKO_URL, "text");
	const parsedLatestEpisodeData = latestEpisodesData.match(/var lastEpisodes = (.+)\;/)?.[1];
	if (!parsedLatestEpisodeData) throw new Error("Failed to fetch or parse latest episode data.");

	const latestEpisodes: Latest[] = JSON.parse(parsedLatestEpisodeData);

	// Prepare latest episodes data and update the database
	await prisma.latest.createMany({
		data: latestEpisodes.map((episode) => ({
			timestamp: new Date(episode.timestamp * 1000),
			episode: episode.episode,
			lang: episode.lang,
			anime_url: episode.url,
			anime_id: Number.parseInt(episode.anime_url.match(/\/(\d+)/i)?.[1]),
		})),
		skipDuplicates: true,
	});
}
