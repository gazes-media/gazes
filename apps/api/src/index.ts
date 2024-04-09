import "@/env.index";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import animeController from "./controllers/animeController";
import { serve } from "@hono/node-server";

const PORT = Number(process.env.PORT);

const prisma = new PrismaClient();
const app = new Hono<{ Variables: { prisma: PrismaClient } }>({});

app.use("*", async (ctx, next) => {
    ctx.set("prisma", prisma);
    await next().catch((err) => {
        console.error("An error occurred: ", err);
        ctx.text("Internal Server Error", 500);
    });
});

app.route("/animes", animeController);

serve({ port: PORT, fetch: app.fetch }, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

async function gracefulDisconnect(name: string, fn: () => Promise<void>) {
    await fn()
        .then(() => console.log(`[${name}] disconnected`))
        .catch((err) => console.error(`[${name}] error: `, err));
}

for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
        await gracefulDisconnect("prisma", () => prisma.$disconnect());
        process.exit(0);
    });
}