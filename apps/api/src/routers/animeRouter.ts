import { AnimeService } from "@/services/animeService";
import { AnimeListQuerystring, type RouteOptions } from "@/types/routeTypes";
import type { FastifyInstance } from "fastify";

export default async function (app: FastifyInstance, { prismaClient, redisClient }: RouteOptions) {
	const animeService = new AnimeService(redisClient, prismaClient);

	app.get<{ Querystring: AnimeListQuerystring }>(
		"/animes",
		{
			schema: { querystring: AnimeListQuerystring },
		},
		async (request, response) => {
			const animes = await animeService.getAnimeListByFilters(request.query);
			response.status(200).send(animes);
		},
	);
}
