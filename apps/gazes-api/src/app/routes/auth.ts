import type { FastifyInstance } from "fastify";
import type { AppOptions } from "@api/main";
import { type RegisterBody, type LoginBody, LoginBodySchema, RegisterBodySchema } from "@api/contracts/authContract";
import { UserService } from "../services/userService";
import { StatusCodes } from "http-status-codes";

/**
 * Initializes authentication routes.
 *
 * @param {FastifyInstance} fastify - The Fastify instance.
 * @param {AppOptions} options - The application options including Prisma clients.
 */
export default async function (fastify: FastifyInstance, { prismaClient }: AppOptions) {
	const userService = new UserService(prismaClient);

	/**
	 * Registers a new user.
	 *
	 * @route POST /register
	 * @param {RegisterBody} req.body - The user's email, password, and username.
	 * @returns The user object and a JWT token in the response header upon success.
	 * @response {201} User created successfully.
	 * @response {400} User already exists.
	 */
	fastify.post<{ Body: RegisterBody }>("/register", { schema: { body: RegisterBodySchema } }, async (req, rep) => {
		try {
			const { email, username, password } = req.body;
			const { user, token } = await userService.registerUser(email, username, password, fastify);

			rep.header("Set-Cookie", `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
			rep.status(StatusCodes.CREATED).send(user);
		} catch (e) {
			if (e.code === "P2002") {
				rep.status(StatusCodes.BAD_REQUEST).send("User already exists");
				return;
			}
			rep.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An unexpected error occurred");
		}
	});

	/**
	 * Authenticates a user.
	 *
	 * @route POST /login
	 * @param {LoginBody} req.body - The user's email and password.
	 * @returns The user object and a JWT token in the response header upon successful authentication.
	 * @response {200} User authenticated successfully.
	 * @response {401} Invalid Credentials.
	 * @response {400} Bad request, possibly due to malformed request syntax.
	 */
	fastify.post<{ Body: LoginBody }>("/login", { schema: { body: LoginBodySchema } }, async (req, rep) => {
		try {
			const { email, password } = req.body;
			const { user, token } = await userService.authenticateUser(email, password, fastify);

			rep.header("Set-Cookie", `token=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`);
			rep.status(StatusCodes.OK).send(user);
		} catch (e) {
			if (e.message === "Invalid Credentials") {
				rep.status(StatusCodes.UNAUTHORIZED).send(e.message);
				return;
			}
			console.error(e);
			rep.status(StatusCodes.INTERNAL_SERVER_ERROR).send("An unexpected error occurred");
		}
	});
}
