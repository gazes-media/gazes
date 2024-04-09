import * as z from "zod";

export const AnimeModel = z.object({
      id: z.number().int(),
      title: z.string(),
      titleEnglish: z.string().nullish(),
      titleRomanji: z.string().nullish(),
      titleFrench: z.string().nullish(),
      others: z.string().nullish(),
      type: z.string(),
      status: z.string(),
      popularity: z.number(),
      url: z.string(),
      genres: z.string().array(),
      urlImage: z.string(),
      score: z.string(),
      startDateYear: z.string(),
      nbEps: z.number().int().nullish(),
      synopsis: z.string().nullish(),
      coverUrl: z.string().nullish(),
});
