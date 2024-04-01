import { Type, Static } from "@sinclair/typebox";

export type UserParams = Static<typeof UserParamsSchema>;

export const UserParamsSchema = Type.Object({
	id: Type.Number(),
});
