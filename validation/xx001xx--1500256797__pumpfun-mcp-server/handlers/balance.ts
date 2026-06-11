import type { RequestHandler } from 'express'
import { isValidSolanaAddress } from '../util'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import { config } from '../config'

export const solBalanceHandler: RequestHandler = async (req, res, next) => {
	try {
		const { type, payload } = req.body
		if (!type || type !== 'balance/sol') {
			res.status(400).json({ error: 'invalid type' })
			return
		}
		if (!payload.userAddress) {
			res.status(400).json({ error: 'userAddress is required' })
			return
		}

		if (!isValidSolanaAddress(payload.userAddress)) {
			res.status(400).json({ error: 'invalid userAddress' })
			return
		}

		const connection = new Connection(config.get('heliusRpcUrl'))

		try {
			const pubKey = new PublicKey(payload.userAddress)
			const balance = await connection.getBalance(pubKey)
			res.json({
				userAddress: payload.userAddress,
				balance: balance / LAMPORTS_PER_SOL,
				unit: 'SOL',
			})
		} catch (e) {
			console.error(' query failed:', e)
			res.status(500).json({ error: 'query failed' })
		}
	} catch (error) {
		next(error)
	}
}

export const splBalanceHandler: RequestHandler = async (req, res, next) => {
	try {
		const { type, payload } = req.body
		if (!type || type !== 'balance/spl') {
			res.status(400).json({ error: 'invalid type' })
			return
		}
		if (!payload.userAddress) {
			res.status(400).json({ error: 'userAddress is required' })
			return
		}
		if (!payload.mint) {
			res.status(400).json({ error: 'mint is required' })
			return
		}

		if (!isValidSolanaAddress(payload.userAddress)) {
			res.status(400).json({ error: 'invalid userAddress' })
			return
		}
		if (!isValidSolanaAddress(payload.mint)) {
			res.status(400).json({ error: 'invalid mint' })
			return
		}

		const connection = new Connection(config.get('heliusRpcUrl'))

		try {
			const userPubKey = new PublicKey(payload.userAddress)
			const mintPubKey = new PublicKey(payload.mint)
			const ata = getAssociatedTokenAddressSync(
				mintPubKey,
				userPubKey,
				false
			)
			const balance = await connection.getTokenAccountBalance(
				ata,
				'processed'
			)
			res.json({
				userAddress: payload.userAddress,
				mint: payload.mint,
				balance: balance.value.uiAmount,
				unit: 'token',
			})
		} catch (e) {
			console.error('query failed:', e)
			res.status(500).json({ error: e })
		}
	} catch (error) {
		next(error)
	}
}
