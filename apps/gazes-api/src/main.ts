import Fastify from "fastify";
import { app } from "./app/app";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = Fastify({
  logger: true,
});

async function main() {
  // Register your application as a normal plugin.
  server.register(app);

  // Store all the animes
  const NEKOSAMA_JSON_URL = "https://neko.ketsuna.com/animes-search-vostfr.json";
  const animeCache = (await fetch(NEKOSAMA_JSON_URL).then((res) => res.json())) as any[];

  prisma.anime
    .createMany({
      data: animeCache.map((a) => ({
        id: a.id,
        NbEps: parseInt(a.nb_eps.split(" ")[0]) || null,
        others: a.others,
        Popularity: a.popularity,
        Score: a.score,
        StartDateYear: a.start_date_year,
        Status: a.status,
        title: a.title,
        title_english: a.title_english,
        title_romanji: a.title_romanji,
        Type: a.type,
        Url: a.url,
        UrlImage: a.url_image,
        Genres: a.genres,
      })),

      skipDuplicates: true,
    })
    .then((a) => console.log(a));

  // Start listening.
  server.listen({ port, host }, (err) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    console.log(`[ ready ] http://${host}:${port}`);
  });
}

main()
  .then(() => {
    prisma.$disconnect();
  })
  .catch(async (e) => {
    server.log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
