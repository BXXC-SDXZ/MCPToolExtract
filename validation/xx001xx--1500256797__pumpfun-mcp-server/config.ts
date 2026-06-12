import dotenv from 'dotenv'

dotenv.config()

interface Config {
	port: number
	heliusApiKey: string
	heliusRpcUrl: string
}

class ConfigLoader {
	private static instance: ConfigLoader
	private config: Config

	private constructor() {
		this.config = {
			port: Number(process.env.PORT) || 8080,
			heliusApiKey: process.env.HELIUS_API_KEY || '',
			heliusRpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
		}
	}

	public static getInstance(): ConfigLoader {
		if (!ConfigLoader.instance) {
			ConfigLoader.instance = new ConfigLoader()
		}
		return ConfigLoader.instance
	}

	public get<K extends keyof Config>(key: K): Config[K] {
		return this.config[key]
	}

	public validate(): void {
		if (!this.config.heliusApiKey) {
			throw new Error('HELIUS_API_KEY is required')
		}
		if (!this.config.heliusRpcUrl) {
			throw new Error('HELIUS_RPC_URL is required')
		}
	}
}

export const config = ConfigLoader.getInstance()
