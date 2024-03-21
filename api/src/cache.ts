import Fuse from "fuse.js";
import { NekoAnime } from "./types/anime.types";

export let cachedAnimes: NekoAnime[] = [];
let fuse: Fuse<NekoAnime> | null = null;

export const getCachedFuse = (): Fuse<NekoAnime> => {
    if (!fuse) {
        fuse = new Fuse(cachedAnimes, {
            includeScore: false,
            keys: ["title", "title_english", "title_romanji", "title_french", "others"],
        });
    }
    return fuse;
};

async function fetchAnimes(): Promise<NekoAnime[]> {
    const response = await fetch("https://neko.ketsuna.com/animes-search-vostfr.json");
    const data = await response.json();
    return data;
}

export async function startCache() {
    try {
        cachedAnimes = await fetchAnimes();
        setInterval(async () => {
            cachedAnimes = await fetchAnimes();
            console.info("Cache refreshed");
        }, 360000);
        console.info("Cache initialized");
    } catch (error) {
        console.error("Failed to initialize cache:", error);
    }
}
