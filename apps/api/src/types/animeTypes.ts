import type { Anime } from "@prisma/client";

export type AnimeWithEpisodes = { episodes: any[] } & Anime;
export interface FetchedAnime {
	id: number;
	title: string;
	title_english: string;
	title_romanji: string;
	title_french: string;
	others: string;
	type: string;
	popularity: number;
	url: string;
	genres: string[];
	url_image: string;
	score: string;
	start_date_year: string;
	nb_eps: string;
}
