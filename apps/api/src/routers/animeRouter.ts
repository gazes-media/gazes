import { AnimeService } from "@/services/animeService";
import { AnimeListQuerystring, type RouteOptions } from "@/types/routeTypes";
import type { FastifyInstance } from "fastify";

export default async function (
	app: FastifyInstance,
	{ prismaClient, redisClient }: RouteOptions,
) {
	const animeService = new AnimeService(redisClient, prismaClient);

	app.get<{ Querystring: AnimeListQuerystring }>(
		"/",
		{
			schema: { querystring: AnimeListQuerystring },
		},
		(request, response) => {
			const { page = 1, title, genres, status, releaseDate } = request.query;
			
		},
	);
}
