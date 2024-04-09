type EnvKey = "HOST" | "JWT_SECRET" | "NEKO_JSON_URL" | "NEKO_URL" | "PORT" | "PROXY_URL"

export function getEnv(key: EnvKey) {
	const envVar = process.env[key]
	if (!envVar) throw new Error(`Environment variable ${key} is not defined`)

	return envVar
}