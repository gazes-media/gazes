export interface UserParams {
	id: number;
}

export const UserParamsSchema = {
	type: "object",
	properties: {
		id: { type: "number" },
	},
};
