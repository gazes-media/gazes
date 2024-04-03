export function getEnv(key: string): string {
	const value = Bun.env[key];
	if (!value) throw `Missing ${key} env variable`;
	return value;
}
