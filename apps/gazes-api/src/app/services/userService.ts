import { EpisodeToStore } from "@api/contracts/animesContract";
import type { AnimeHistory, Episode, Prisma, PrismaClient } from "@prisma/client";
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
			if(request.user){
				request.user = await this.prisma.user.findUnique({
					where: { id: (request.user as { id: number }).id },
					select: { id: true, username: true },
				});
			}
		} catch (err) {
			reply.send(err)
		}
	}

	async getUserById(id: number) {
		return this.prisma.user.findUnique({
			where: { id },
			select: { id: true, username: true},
		});
	}

	async getHistory(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { history: true },
		});

		return user?.history || [];
	}

	async postToHistory(userId: number, episode: EpisodeToStore) {
		const { id } = await this.prisma.episode.findFirst({
			where:{
				anime_id: episode.id,
				num: episode.ep
			},
			select: {
				id: true
			}
		})
		if(id){
			return this.prisma.animeHistory.create({
				data: {
					user_id: userId,
					episode_id: id,
					timestamp: episode.time,	
					duration: episode.duration,
				},
			})
		}
		return undefined;
	}

	async deleteFromHistory(userId: number, animeId: number, episode: number) {
		return this.prisma.animeHistory.deleteMany({
			where: {
				user_id: userId,
				episode:{
					num: episode,
					anime_id: animeId
				}
			},
		})
	}
}
