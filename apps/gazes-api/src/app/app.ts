import * as path from "path";
import { FastifyInstance } from "fastify";
import AutoLoad from "@fastify/autoload";
import { PrismaClient } from "@prisma/client";
import { AppOptions } from "@api/main";
import { config } from "@api/config";
import { Latest } from "@api/contracts/animesContract";
import { fetchType } from "./utils/fetchUtils";

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  updateAnimeDatabase(opts.prisma);
  setInterval(() => updateAnimeDatabase(opts.prisma), 3600000);

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: { ...opts },
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: { ...opts },
  });
}

async function updateAnimeDatabase(prisma: PrismaClient) {

  const animeList: any[] = await fetchType(config.NEKO_JSON_URL, "json");

  await prisma.anime.createMany({
    data: animeList.map((a) => ({ ...a, nb_eps: parseInt(a.nb_eps.split(" ")[0]) })),
    skipDuplicates: true,
  });

  const data: string = await fetchType(config.NEKO_URL, "text");
  
  const parsedData = data.match(/var lastEpisodes = (.+)\;/)?.[1];
  if (!parsedData) return;

  const latestEpisodes = JSON.parse(parsedData) as Latest[];

  await prisma.latest.createMany({
    data: latestEpisodes.map((episode) => ({
      timestamp: new Date(episode.timestamp),
      episode: episode.episode,
      lang: episode.lang,
      anime_url: episode.url,
      animeId: parseInt(episode.anime_url.match(/\/(\d+)/i)?.[1]),
    })),

    skipDuplicates: true,
  });

}
