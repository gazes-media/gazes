import * as path from "path";
import { FastifyInstance } from "fastify";
import AutoLoad from "@fastify/autoload";
import { PrismaClient } from "@prisma/client";
import { AppOptions } from "@api/main";
import { config } from "@api/config";
import { Latest } from "@api/contracts/animesContract";

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
  const animeList = (await fetch(config.NEKO_JSON_URL).then((res) => res.json())) as any[];

  await prisma.anime.createMany({
    data: animeList.map((a) => ({ ...a, nb_eps: parseInt(a.nb_eps.split(" ")[0]) })),
    skipDuplicates: true,
  });

  const data = await fetch(config.NEKO_URL).then((res) => res.text());
    const parsedData = /var lastEpisodes = (.+)\;/gm.exec(data);
    let latestEpisodes: Latest[] = [];
    if (parsedData) latestEpisodes = JSON.parse(parsedData[1]);
  await prisma.latest.createMany({
    data: latestEpisodes.map((d) => ({
      timestamp: new Date(d.timestamp),
      episode: d.episode,
      lang: d.lang,
      anime_url: d.url,
      animeId: parseInt(d.anime_url.match(new RegExp(/\/(\d+)/, "i"))?.[1]),
    })),
    skipDuplicates: true,
  })
}
