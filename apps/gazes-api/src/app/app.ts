import * as path from "path";
import { FastifyInstance } from "fastify";
import AutoLoad from "@fastify/autoload";
import { PrismaClient } from "@prisma/client";
import { AppOptions } from "../main";

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Place here your custom code!
  updateAnimeDatabase(opts.prisma);
  setInterval(() => updateAnimeDatabase(opts.prisma), 3600000);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: { ...opts },
  });
}

async function updateAnimeDatabase(prisma: PrismaClient) {
  const NEKOSAMA_JSON_URL = "https://neko.ketsuna.com/animes-search-vostfr.json";
  const animeList = (await fetch(NEKOSAMA_JSON_URL).then((res) => res.json())) as any[];

  await prisma.anime.createMany({
    data: animeList.map((a) => ({ ...a, nb_eps: parseInt(a.nb_eps.split(" ")[0]) })),
    skipDuplicates: true,
  });
}
