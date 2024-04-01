import type { FastifyInstance } from "fastify";
import type { AppOptions } from "@api/main";
import { UserService } from "../services/userService";
import { StatusCodes } from "http-status-codes";

export default async function (fastify: FastifyInstance, { redisClient, prismaClient }: AppOptions) {
	const userService = new UserService(prismaClient)
	// TODO
	fastify.get("/users/@me",{
		onRequest:[userService.authenticate]
	}, (req, rep) =>{
		rep.status(StatusCodes.OK).send(req.user)
	})
}
