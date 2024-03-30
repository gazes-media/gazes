import type { AppOptions } from "@api/main";
import AutoLoad from "@fastify/autoload";
import type { FastifyInstance } from "fastify";
import * as path from "node:path";

/**
 * Initializes the Fastify application with auto-loaded plugins and routes,
 * and periodically updates the anime database.
 */
export async function app(fastify: FastifyInstance, opts: AppOptions) {
	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "plugins"),
		options: { ...opts },
	});

	fastify.register(AutoLoad, {
		dir: path.join(__dirname, "routes"),
		options: { ...opts },
	});
}