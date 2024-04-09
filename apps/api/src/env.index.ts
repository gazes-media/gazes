import { type TypeOf, z } from "zod";

const env = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.string().regex(/^\d+$/),
});

declare global {
    namespace NodeJS {
        interface ProcessEnv extends TypeOf<typeof env> {}
    }
}

try {
    env.parse(process.env);
} catch (err) {
    if (err instanceof z.ZodError) {
        const { fieldErrors } = err.flatten();
        const errorMessage = Object.entries(fieldErrors)
            .map(([field, errors]) => (errors ? `${field}: ${errors.join(", ")}` : field))
            .join("\n");

        throw new Error(`Missing environment variables:\n ${errorMessage}`);
    }
}
