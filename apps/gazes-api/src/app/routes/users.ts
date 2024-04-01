import type { FastifyInstance } from "fastify";
import type { AppOptions } from "@api/main";
import { UserService } from "@api/app/services/userService";
import { StatusCodes } from "http-status-codes";
import { DeleteEpisodeParams, DeleteEpisodeParamsSchema, SendEpisodeParams, SendEpisodeParamsSchema, UserParams, UserParamsSchema } from "@api/contracts/userContract";

export default async function (fastify: FastifyInstance, { prismaClient }: AppOptions) {
	const userService = new UserService(prismaClient)

	fastify.get<{ Params: UserParams}>("/users/:id", { schema: { params: UserParamsSchema } , onRequest:[userService.authenticate]}, async (req, rep) => {
		if(req.params.id === "@me"){
			rep.status(StatusCodes.OK).send(req.user);
			return;
		}
		const user = await userService.getUserById(req.params.id);
		if (!user) {
			rep.status(StatusCodes.NOT_FOUND).send("User Not Found");
			return;
		}

		rep.status(StatusCodes.OK).send(user);
	});

	fastify.get<{ Params: UserParams }>("/users/:id/history", { schema: { params: UserParamsSchema }, onRequest:[userService.authenticate]}, async (req, rep) => {
		if(req.params.id === "@me"){
			req.params.id = (req.user as { id: number }).id;
		}
		const history = await userService.getHistory(req.params.id);
		rep.status(StatusCodes.OK).send(history);
	});

	fastify.post<{ Body: SendEpisodeParams}>("/users/@me/history",{
		schema: { body: SendEpisodeParamsSchema },
		onRequest:[userService.authenticate]
	}, async (req, rep) => {
		const userId = (req.user as { id: number }).id;
		const episodeToStore = await userService.postToHistory(userId,req.body);
		if(episodeToStore) rep.status(StatusCodes.CREATED).send(episodeToStore);	
		rep.status(StatusCodes.NOT_FOUND).send("Episode Not Found");
	});

	fastify.delete<{ Body: DeleteEpisodeParams}>("/users/@me/history",{
		schema: { body: DeleteEpisodeParamsSchema },
		onRequest:[userService.authenticate]
	}, async (req, rep) => {
		const userId = (req.user as { id: number }).id;
		const { id, ep } = req.body;
		const episodeToDelete = await userService.deleteFromHistory(userId,id,ep);
		if(!episodeToDelete){
			rep.status(StatusCodes.NOT_FOUND).send("Episode Not Found");
			return;
		}
		rep.status(StatusCodes.NO_CONTENT).send();
	});
	
}
