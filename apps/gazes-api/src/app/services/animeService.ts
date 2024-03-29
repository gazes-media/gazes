import { Anime, Episode, PrismaClient } from "@prisma/client";
import he from "he";
import { config } from "config";
import { RedisClient, server } from "main";

async function fetchText(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch: " + url);
    return await response.text();
  } catch (err) {
    server.log.error(err);
    return undefined;
  }
}

/**
 * Fetches an anime by its ID from the database. If certain details like the synopsis,
 * cover URL, or episodes are missing, it updates these details from an external source.
 */
export async function getAnimeById(
  prisma: PrismaClient,
  redis: RedisClient,
  id: number
): Promise<({ episodes: Episode[] } & Anime)> {
  // récupérer dans le cache la map de l'anime
  const cachedAnime = await redis.get(`anime:${id}`);
  if (cachedAnime) return JSON.parse(cachedAnime);

  let retrievedAnime = await prisma.anime.findUnique({
    where: { id },
    include: { episodes: { where: { animeId: id } } },
  });

  if (!retrievedAnime) return undefined;

  if (
    !retrievedAnime.cover_url ||
    retrievedAnime.episodes.length === 0 ||
    !retrievedAnime.synopsis ||
    retrievedAnime.status !== "1"
  ) {
    retrievedAnime = await updateAnimeDetails(prisma, retrievedAnime);
  }

  if (retrievedAnime) {
    await redis.set(`anime:${id}`, JSON.stringify(retrievedAnime));
    await redis.expireAt(`anime:${id}`, Date.now() + 7200000);
  }
  return retrievedAnime;
}

/**
 * Updates the details of an anime by fetching them from an external source.
 */
async function updateAnimeDetails(prisma: PrismaClient, anime: Anime) {
  const html = await fetch(`https://neko.ketsuna.com/${anime.url}`)
    .then((res) => res.text())
    .catch((err) => server.log.error(err));
  if (!html) return undefined;

  const status = extractStatus(html);
  const synopsis = extractSynopsis(html);

  console.log(synopsis);

  const cover_url = extractCoverUrl(html);
  const newEpisodes = extractEpisodes(html);

  return await prisma.anime.update({
    where: { id: anime.id },
    data: {
      synopsis,
      cover_url,
      status,
      nb_eps: newEpisodes.length,
      episodes: {
        createMany: {
          data: newEpisodes,
          skipDuplicates: true,
        },
      },
    },
    include: { episodes: true },
  });
}

function extractStatus(html: string): string {
  const status = html.match(/(<small>Status<\/small> )(.*)/)?.[2];
  return status == "En cours" ? "1" : "2";
}

/**
 * Extracts the synopsis from the HTML content.
 */
function extractSynopsis(html: string): string {
  return he.decode(/(<div class="synopsis">\n<p>\n)(.*)/gm.exec(html)?.[2] as string).replace(/<[^>]*>/g, "");
}

/**
 * Extracts the cover URL from the HTML content.
 */
function extractCoverUrl(html: string): string {
  return /<div id="head" style="background-image: url\((.*)\);/gm.exec(html)?.[1] ?? "";
}

/**
 * Extracts episodes from the HTML content.
 */
function extractEpisodes(html: string): any[] {
  const episodes = JSON.parse(/var episodes = (.+);/gm.exec(html)?.[1] ?? "[]");
  return episodes.map(({ title, ...newEpisode }: any) => newEpisode);
}

export async function getEpisodeVideo(episode: Episode, vf: boolean = false) {
  let proxiedEpisodeUrl = "https://neko.ketsuna.com" + episode.url;
  if (vf) proxiedEpisodeUrl = proxiedEpisodeUrl.replace("vostfr", "vf");

  const episodeHtml = await fetch(proxiedEpisodeUrl).then((res) => res.text());
  if (!episodeHtml) return undefined;

  const playerUrl = episodeHtml.match(/video\[0\] = '([^']*)';/)?.[1];
  if (!playerUrl) return undefined;

  const playerHtml = await fetch(config.PROXY_URL + encodeURIComponent(playerUrl)).then((res) => res.text());
  if (!playerHtml || playerHtml === "") return undefined;

  const scriptUrl = playerHtml.match(/src="(https?:\/\/[^"]*\/f\/u\/u[^"]*)"/)?.[1];
  if (!scriptUrl) return undefined;

  const scriptJs = await fetch(config + encodeURIComponent(scriptUrl)).then((res) => res.text());
  if (!scriptJs) return undefined;

  const videoObjectEncoded = scriptJs.match(/atob\("([^"]+)"/)?.[1];
  if (!videoObjectEncoded) return undefined;

  const videoObject = atob(videoObjectEncoded);
  const videoUrl = videoObject.match(/"ezofpjbzoiefhzofsdhvuzehfg"\s*:\s*"([^"]+)"/)?.[1];

  if (!videoUrl) return undefined;
  return config.PROXY_URL + encodeURIComponent(videoUrl.replace(/\\/g, ""));
}
