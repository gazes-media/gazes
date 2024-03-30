import { config } from "@api/config";
import { RedisClient } from "@api/main";
import { Anime, Episode, PrismaClient } from "@prisma/client";
import he from "he";
import { fetchType } from "../utils/fetchUtils";

// Extracts various details from the HTML content.
function extractStatus(html: string): string {
  const statusMatch = html.match(/<small>Status<\/small>\s*(\w+)/)
  return statusMatch && statusMatch[1] === "En cours" ? "1" : "2"
}

function extractSynopsis(html: string): string {
  const synopsisMatch = /<div class="synopsis">\s*<p>\s*([\s\S]*?)\s*<\/p>/im.exec(html);
  return synopsisMatch ? he.decode(synopsisMatch[1].replace(/<[^>]*>/g, "")) : "";
}

function extractCoverUrl(html: string): string {
  return html.match(/<div id="head" style="background-image: url\((.*?)\);/)?.[1] ?? "";
}

function extractEpisodes(html: string): Episode[] {
  const episodesMatch = html.match(/var episodes = (\[.*?\]);/s);
  if (!episodesMatch) return [];

  try {
    const episodes = JSON.parse(episodesMatch[1]);
    return episodes.map(({ title, ...newEpisode }: { title: string } & Episode) => newEpisode);
  } catch (e) {
    console.error("Error parsing episodes JSON:", e);
    return [];
  }
}


/**
 * Fetches an anime by its ID from the database. If certain details like the synopsis,
 * cover URL, or episodes are missing, it updates these details from an external source.
 */
export async function getAnimeById(prisma: PrismaClient, redis: RedisClient, id: number): Promise<({ episodes: Episode[] } & Anime) | undefined> {
  
  const cachedAnime = await redis.get(`anime:${id}`);
  if (cachedAnime) return JSON.parse(cachedAnime);

  let anime = await prisma.anime.findUnique({
    where: { id },
    include: { episodes: true },
  });

  if (!anime) return undefined;
  if (!anime.cover_url || anime.status !== "1") anime = await updateAnimeDetails(prisma, anime)

  await redis.set(`anime:${id}`, JSON.stringify(anime))
  await redis.expireAt(`anime:${id}`, Date.now() + 7200000);

  return anime;

}

/**
 * Updates the details of an anime by fetching them from an external source.
 */
async function updateAnimeDetails(prisma: PrismaClient, anime: Anime): Promise<{episodes: Episode[]} & Anime> {

  const animeHtml = await fetchType<string>(`${config.NEKO_URL}/${anime.url}`, "text")
  if (!animeHtml) return undefined;

  const status = extractStatus(animeHtml);
  const synopsis = extractSynopsis(animeHtml);
  const cover_url = extractCoverUrl(animeHtml);
  const newEpisodes = extractEpisodes(animeHtml);

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



export async function getEpisodeVideo(episode: Episode, vf: boolean = false): Promise<string | undefined> {

  // Construct the episode URL, replacing "vostfr" with "vf" if necessary.
  const proxiedEpisodeUrl = new URL(vf ? episode.url.replace("vostfr", "vf") : episode.url, config.NEKO_URL).toString();

  // Sequentially resolve each dependency in the process to fetch the video URL.
  try {

    const episodeHtml = await fetchType<string>(proxiedEpisodeUrl, "text");
    const playerUrlMatch = episodeHtml?.match(/video\[0\] = '([^']*)';/);
    if (!playerUrlMatch) return undefined;

    const playerHtml = await fetchType<string>(new URL(encodeURIComponent(playerUrlMatch[1]), config.PROXY_URL).toString(), "text");
    const scriptUrlMatch = playerHtml?.match(/src="(https?:\/\/[^"]*\/f\/u\/u[^"]*)"/);
    if (!scriptUrlMatch) return undefined;

    const scriptJs = await fetchType<string>(new URL(encodeURIComponent(scriptUrlMatch[1]), config.PROXY_URL).toString(), "text");
    const videoObjectEncodedMatch = scriptJs?.match(/atob\("([^"]+)"/);
    if (!videoObjectEncodedMatch) return undefined;

    const videoObject = atob(videoObjectEncodedMatch[1]);
    const videoUrlMatch = videoObject.match(/"ezofpjbzoiefhzofsdhvuzehfg"\s*:\s*"([^"]+)"/);
    if (!videoUrlMatch) return undefined;

    return new URL(encodeURIComponent(videoUrlMatch[1].replace(/\\/g, "")), config.PROXY_URL).toString();

  } catch (error) {

    console.error("Failed to fetch episode video:", error);
    return undefined;
  
  }

}
