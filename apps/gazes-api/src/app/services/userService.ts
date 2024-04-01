import type { PrismaClient } from "@prisma/client";
import { hash, verify } from "argon2";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

/**
 * Service class for handling user-related operations such as registration and authentication.
 */
export class UserService {
	constructor(
		private readonly prisma: PrismaClient
	) { }

	async registerUser(email: string, username: string, password: string, fastify: FastifyInstance) {
		const hashedPassword = await hash(password);
		const newUser = await this.prisma.user.create({
			data: { email, username, password: hashedPassword },
			select: { id: true, username: true },
		});

		const token = fastify.jwt.sign({ id: newUser.id });
		return { user: newUser, token };
	}

	async authenticateUser(email: string, password: string, fastify: FastifyInstance) {
		const userWithPassword = await this.prisma.user.findUnique({
			where: { email },
			select: { id: true, username: true, password: true },
		});

		if (!userWithPassword || !(await verify(userWithPassword.password, password))) {
			throw new Error("Invalid Credentials");
		}

		const { password: _, ...userWithoutPassword } = userWithPassword;
		const token = fastify.jwt.sign({ id: userWithoutPassword.id });
		return { user: userWithoutPassword, token };
	}

	async authenticate(request: FastifyRequest, reply: FastifyReply) {
		try {
			await request.jwtVerify()
		} catch (err) {
			reply.send(err)
		}
	}
}
