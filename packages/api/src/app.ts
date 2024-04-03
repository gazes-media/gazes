import { Glob } from "bun";
import fastify from "fastify";
import { join } from "node:path";

// Initialize a Fastify application instance with specific configurations.
export const app = fastify({
	logger: true, // Enable loggin for the application
	disableRequestLogging: true, // Disable request logging to avoid clutter in the log output
});

// Synamically import and register router modules found by globbing thep roject directory for files
// with a ".router." in their names.
for await (const file of new Glob("**/*Router.*").scan(import.meta.dir)) {
	// Register each found router module with the Fastify application.
	// The router modules are expected to export a default function that defines routes.
	app.register((await import(join(import.meta.dir, file))).default);
}
