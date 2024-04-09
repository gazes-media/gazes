import { Hono } from "hono";
import { animesRouter } from "./animes";

export function createRouter(): Hono {
	const app = new Hono();
	
    app.route("/animes", animesRouter);

	return app;
}
