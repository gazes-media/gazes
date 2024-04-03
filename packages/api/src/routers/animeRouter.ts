import type { RouteOptions } from "@/app";
import type { FastifyInstance } from "fastify";
import type { IReply } from "@gazes/types";

export default async function (app: FastifyInstance, opts: RouteOptions) {
	app.get<{ Reply: IReply }>("/animes", (request, reply) => {});
}
