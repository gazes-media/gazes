import { AppOptions } from "@api/main";
import { FastifyInstance } from "fastify";
import { AnimeService } from "../services/animeService";
import { AnimeDetailParams, AnimeDetailParamsSchema, AnimeListQuerystring, AnimeListQuerystringSchema } from "@api/contracts/animesContract";
import { StatusCodes } from "http-status-codes";
import { Anime, Prisma } from "@prisma/client";
import { CacheManager } from "../utils/cacheManager";

export default async function (fastify: FastifyInstance, { redisClient, prismaClient }: AppOptions) {
	const cacheManager = new CacheManager(redisClient);
	const animeService = new AnimeService(prismaClient, cacheManager);

	fastify.get<{ Querystring: AnimeListQuerystring }>(
		"/animes",
		{
			schema: { querystring: AnimeListQuerystringSchema },
		},
		async (req, rep) => {
			try {
				const { page = 1, title, genres, status, releaseDate } = req.query;
				const cacheKey = `animesList:${page}:${title}:${genres}:${status}:${releaseDate}`;

				// Attempt to retrieve cached data
				const cachedResult: Anime[] = await cacheManager.getCache(cacheKey);
				if (cachedResult) {
					rep.status(StatusCodes.OK).send(cachedResult || []);
					return;
				}

				const animesList = await animeService.getAndEnrichAnimesList({page, title, genres, status, releaseDate})
				await cacheManager.setCache(cacheKey, animesList);
				
				rep.status(StatusCodes.OK).send(animesList || []);
			} catch (error) {
				console.error(error);
				rep.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error: "Internal Server Error" });
			}
		},
	);

	fastify.get("/animes/latest", async (req, rep) => {
		const latestAnimes = await animeService.getLatestAnimes();

		rep.status(StatusCodes.OK).send(latestAnimes);
	});

	fastify.get<{ Params: AnimeDetailParams }>("/animes/:id", { schema: { params: AnimeDetailParamsSchema } }, async (req, rep) => {
		const anime = await animeService.getAnimeById(req.params.id);

		if (!anime) {
			rep.status(404).send("Anime Not Found");
			return;
		}

		rep.status(200).send(anime);
	});
}


