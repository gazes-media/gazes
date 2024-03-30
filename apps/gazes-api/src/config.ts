type Config = {
    PROXY_URL: string;
    NEKO_JSON_URL: string;
    NEKO_URL: string;
    HOST: string;
    PORT: number;
    JWT_SECRET: string;
}

const requiredConfigs: (keyof Config)[] = ['HOST', 'JWT_SECRET', 'NEKO_JSON_URL', 'NEKO_URL', 'PORT', 'PROXY_URL']

export let config: Partial<Config> = {};
let missingConfigs: string[] = [];

for (const key of requiredConfigs) {
    const value = process.env[key];
    
    if (!value) {
        missingConfigs.push(key)
        continue
    }

    if (key === 'PORT') {
        config[key] = parseInt(value, 10)
        continue
    }

    config[key] = value
}

if (missingConfigs.length > 0) {
    console.error('Missing required configurations:', missingConfigs.join(', '));
    process.exit(1);
}