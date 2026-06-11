import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { buildVersionedTx, DEFAULT_DECIMALS, PumpFunSDK } from '../pumpfun'
import type { RequestHandler } from 'express'
import { isValidSolanaAddress } from '../util'
import { AnchorProvider } from '@coral-xyz/anchor'
import { config } from '../config'

export const createBuyTxHandler: RequestHandler = async (req, res, next) => {
	try {
		const { type, payload } = req.body
		if (!type || type !== 'pumpfun/buy') {
			res.status(400).json({ error: 'invalid type' })
			return
		}
		if (
			!payload.userAddress ||
			!isValidSolanaAddress(payload.userAddress)
		) {
			res.status(400).json({ error: 'userAddress is required' })
			return
		}
		if (!payload.mint || !isValidSolanaAddress(payload.mint)) {
			res.status(400).json({ error: 'mint is required' })
			return
		}
		if (
			!payload.buyAmountHumanReadableSol ||
			payload.buyAmountHumanReadableSol <= 0 ||
			payload.buyAmountHumanReadableSol > 1000000
		) {
			res.status(400).json({
				error: 'buyAmountHumanReadableSol is required',
			})
			return
		}

		const buyer = new PublicKey(payload.userAddress)
		const mint = new PublicKey(payload.mint)
		const buyAmountHumanReadableSol = payload.buyAmountHumanReadableSol

		let connection = new Connection(config.get('heliusRpcUrl'))
		const provider = new AnchorProvider(
			connection,
			{
				publicKey: buyer,
				signTransaction: async () => {
					throw new Error('not implemented')
				},
				signAllTransactions: async () => {
					throw new Error('not implemented')
				},
			},
			{}
		)
		let sdk = new PumpFunSDK(provider)
		let buyAmountSol = BigInt(buyAmountHumanReadableSol * LAMPORTS_PER_SOL)
		let buyInstructions = await sdk.getBuyInstructionsBySolAmount(
			buyer,
			mint,
			buyAmountSol
		)
		let unSignedtx = await buildVersionedTx(
			connection,
			buyer,
			buyInstructions
		)
		const v0TxBase58 = bs58.encode(unSignedtx.serialize())
		res.json({
			v0BuyTxBase58: v0TxBase58,
			instructions: buyInstructions,
			userAddress: buyer.toBase58(),
			mint: mint.toBase58(),
			buyAmountHumanReadableSol,
		})
	} catch (error) {
		next(error)
	}
}

export const createSellTxHandler: RequestHandler = async (req, res, next) => {
	try {
		const { type, payload } = req.body
		if (!type || type !== 'pumpfun/sell') {
			res.status(400).json({ error: 'invalid type' })
			return
		}
		if (
			!payload.userAddress ||
			!isValidSolanaAddress(payload.userAddress)
		) {
			res.status(400).json({ error: 'userAddress is required' })
			return
		}
		if (!payload.mint || !isValidSolanaAddress(payload.mint)) {
			res.status(400).json({ error: 'mint is required' })
			return
		}
		if (!payload.sellAmountHumanReadableToken) {
			res.status(400).json({
				error: 'sellAmountHumanReadableToken is required',
			})
			return
		}
		if (!payload.slippage) {
			payload.slippage = 99
		}
		if (payload.slippage < 2 || payload.slippage > 100) {
			res.status(400).json({
				error: 'slippage must be between 2 and 100',
			})
			return
		}

		const buyer = new PublicKey(payload.userAddress)
		const mint = new PublicKey(payload.mint)
		const sellAmountHumanReadableToken =
			payload.sellAmountHumanReadableToken
		const slippage = payload.slippage

		let connection = new Connection(config.get('heliusRpcUrl'))
		const provider = new AnchorProvider(
			connection,
			{
				publicKey: buyer,
				signTransaction: async () => {
					throw new Error('not implemented')
				},
				signAllTransactions: async () => {
					throw new Error('not implemented')
				},
			},
			{}
		)
		let sdk = new PumpFunSDK(provider)

		let sellAmountToken = BigInt(
			sellAmountHumanReadableToken * 10 ** DEFAULT_DECIMALS
		)
		let slippageBasisPoints = BigInt(slippage * 100)
		let sellInstructions = await sdk.getSellInstructionsByTokenAmount(
			buyer,
			mint,
			sellAmountToken,
			slippageBasisPoints
		)
		let unSignedtx = await buildVersionedTx(
			connection,
			buyer,
			sellInstructions
		)
		const v0TxBase58 = bs58.encode(unSignedtx.serialize())
		res.json({
			v0SellTxBase58: v0TxBase58,
			instructions: sellInstructions,
			userAddress: buyer.toBase58(),
			mint: mint.toBase58(),
			sellAmountHumanReadableToken,
			slippage,
		})
	} catch (error) {
		next(error)
	}
}
