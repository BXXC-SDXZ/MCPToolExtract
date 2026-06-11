import type { RequestHandler } from 'express'
import { isValidSolanaTxId } from '../util'
import { Connection } from '@solana/web3.js'
import { config } from '../config'

export const txStatusHandler: RequestHandler = async (req, res, next) => {
	try {
		const { type, payload } = req.body
		if (!type || type !== '/sol/txid') {
			res.status(400).json({ error: 'invalid type' })
			return
		}
		if (!payload.txid) {
			res.status(400).json({ error: 'txid is required' })
			return
		}

		if (!isValidSolanaTxId(payload.txid)) {
			res.status(400).json({ error: 'invalid txid' })
			return
		}

		const connection = new Connection(config.get('heliusRpcUrl'))

		try {
			const tx = await connection.getTransaction(payload.txid, {
				maxSupportedTransactionVersion: 0,
			})
			if (!tx) {
				res.json({
					txid: payload.txid,
					status: 'not found',
				})
				return
			}
			res.json({
				txid: payload.txid,
				slot: tx.slot,
				blockTime: tx.blockTime,
				meta: tx.meta,
				log: tx.meta?.logMessages,
			})
		} catch (e) {
			console.error('query failed:', e)
			res.status(500).json({ error: e })
		}
	} catch (error) {
		next(error)
	}
}
