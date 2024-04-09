import { Hono } from "hono";

export const animesRouter = new Hono();

animesRouter.get("/", async (c) => {
	return c.json({ ok: true });
});
