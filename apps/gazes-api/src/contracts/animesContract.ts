import { Anime, Episode } from "@prisma/client";
import { Type, Static } from "@sinclair/typebox";

export type AnimeListQuerystring = Static<typeof AnimeListQuerystringSchema>;

export type AnimeWithEpisodes = {episodes: Episode[]} & Anime

export const AnimeListQuerystringSchema = Type.Object({
	page: Type.Optional(Type.Number()),
	title: Type.Optional(Type.String()),
	genres: Type.Optional(Type.String()),
	status: Type.Optional(Type.Number()),
	releaseDate: Type.Optional(Type.Number()),
});



export type AnimeDetailParams = Static<typeof AnimeDetailParamsSchema>;

export const AnimeDetailParamsSchema = Type.Object({
	id: Type.Number(),
});


export type EpisodeParams = Static<typeof EpisodeParamsSchema>;

export const EpisodeParamsSchema = Type.Object({
	id: Type.Number(),
	ep: Type.Number(),
});


export interface Latest {
	timestamp: number;
	episode: string;
	lang: string;
	url: string;
	anime_url: string;
}

export interface EpisodeToStore {
	id: number;
	ep: number;
	time: number;
	duration: number;
}