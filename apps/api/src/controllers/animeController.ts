import { type Context, Hono } from "hono";
import { getAnimesQuery } from "@/schemas/animeSchema";
import type { PrismaClient } from "@prisma/client";

export default new Hono().get("/", getAnimes);

async function getAnimes(ctx: Context) {
    const query = getAnimesQuery.safeParse(ctx.req.query());

    if (!query.success) {
        return ctx.json({ error: { title: "Invalid query", details: query.error } }, 400);
    }

    const { title, status, genres, page, limit } = query.data;
    const offset = (page - 1) * limit;

    const prisma = ctx.get("prisma") as PrismaClient;
    const animes = await prisma.anime.findMany({
        where: {
            title: title ? { contains: title } : undefined,
            status,
            genres: genres ? { hasSome: genres } : undefined,
        },
        skip: offset,
        take: limit,
    });

    return ctx.json(animes, 200);
}
