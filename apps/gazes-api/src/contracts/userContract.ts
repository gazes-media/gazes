import { Type, Static } from "@sinclair/typebox";

export type UserParams = Static<typeof UserParamsSchema>;

export const UserParamsSchema = Type.Object({
    id: Type.Union([Type.Number(), Type.Literal("@me")]),
});

export const SendEpisodeParamsSchema = Type.Object({
	id: Type.Number(),
	ep: Type.Number(),
	time: Type.Number(),
	duration: Type.Number(),
});

export type SendEpisodeParams = Static<typeof SendEpisodeParamsSchema>;

export const DeleteEpisodeParamsSchema = Type.Pick(SendEpisodeParamsSchema, ["id", "ep"]);

export type DeleteEpisodeParams = Static<typeof DeleteEpisodeParamsSchema>;