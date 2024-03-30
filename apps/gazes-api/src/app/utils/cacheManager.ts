import { RedisClientType } from "redis";

export class CacheManager {
	constructor(
		private readonly redisClient: RedisClientType
	) {}

	async setCache(key: string, value: unknown, ttl = 3600): Promise<void> {
		const stringValue = JSON.stringify(value);
		await this.redisClient.setEx(key, ttl, stringValue);
	}

	async getCache<T>(key: string): Promise<T | undefined> {
		const cachedValue = await this.redisClient.get(key);
		if (!cachedValue) return undefined;

		return JSON.parse(cachedValue) as T;
	}
}