import { z } from "zod";

export const getAnimesQuery = z.object({
    title: z.string().optional(),
    status: z.string().optional(),
    genres: z.array(z.string()).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(25).max(100).default(25),
});
