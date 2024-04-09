import type { Hono } from "hono";
import type { Config } from "./config";
import { serve } from "@hono/node-server";

export function createServer(app: Hono, config: Config) {
	return serve({
		port: config.PORT,
		fetch: app.fetch,
	});
}
