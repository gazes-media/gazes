import type { FastifyInstance } from "fastify";
import type { AppOptions } from "@api/main";
import { UserService } from "../services/userService";

export default async function (fastify: FastifyInstance, { redisClient, prismaClient }: AppOptions) {
	const userService = new UserService(prismaClient)
	// TODO
	fastify.get("/users/@me",{
		onRequest:[userService.authenticate]
	}, (req, rep) =>{
		return req.user
	})
}
