import type { PrismaClient } from "@prisma/client";
import { Type, type Static } from "@sinclair/typebox";
import type { RedisClientType } from "redis";

// Route-related types and interfaces below

export type RouteOptions = {
	prismaClient: PrismaClient;
	redisClient: RedisClientType;
};

export type SuccessResponse = {
	data: unknown;
	error: never;
};

export type ErrorResponse = {
	data: never;
	error: {
		title: string;
		detail: string;
	};
};

export type Response = SuccessResponse|ErrorResponse

export const AnimeListQuerystring = Type.Object({
	page: Type.Optional(Type.Number()),
	title: Type.Optional(Type.String()),
	genres: Type.Optional(Type.String()),
	status: Type.Optional(Type.Number()),
	releaseDate: Type.Optional(Type.Number()),
});

export type AnimeListQuerystring = Static<typeof AnimeListQuerystring>