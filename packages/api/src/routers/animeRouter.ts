import type { FastifyInstance } from "fastify";
import type { IReply } from "@gazes/types";
import type { RouteOptions } from "@/types/routeTypes";

export default async function (app: FastifyInstance, opts: RouteOptions) {
	app.get<{ Reply: IReply }>("/animes", (request, reply) => {

	});
}
