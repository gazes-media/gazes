interface ENV {
	NODE_ENV: string;
	PORT: number | undefined;
}

export interface Config {
	NODE_ENV: string;
	PORT: number;
}

function getConfig(): ENV {
	return {
		NODE_ENV: process.env.NODE_ENV || "development",
		PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
	};
}

function getSanitzedConfig(config: ENV): Config {
	for (const [key, value] of Object.entries(config)) {
		if (value === undefined) {
			throw new Error(`Missing key ${key} in .env`);
		}
	}

	return config as Config;
}

const config = getConfig();
export default getSanitzedConfig(config);
