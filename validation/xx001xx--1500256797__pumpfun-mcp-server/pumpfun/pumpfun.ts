import {
	Connection,
	Keypair,
	PublicKey,
	Transaction,
	VersionedTransaction,
} from '@solana/web3.js'
import type { Commitment, Finality } from '@solana/web3.js'
import { Program, type Provider } from '@coral-xyz/anchor'
import { GlobalAccount } from './globalAccount'
import type {
	CompleteEvent,
	CreateEvent,
	CreateTokenMetadata,
	PriorityFee,
	PumpFunEventHandlers,
	PumpFunEventType,
	SetParamsEvent,
	TradeEvent,
	TransactionResult,
} from './types'
import {
	toCompleteEvent,
	toCreateEvent,
	toSetParamsEvent,
	toTradeEvent,
} from './events'
import {
	createAssociatedTokenAccountInstruction,
	getAccount,
	getAssociatedTokenAddress,
} from '@solana/spl-token'
import { BondingCurveAccount } from './bondingCurveAccount'
import { BN } from 'bn.js'
import {
	DEFAULT_COMMITMENT,
	DEFAULT_FINALITY,
	buildTx,
	calculateWithSlippageBuy,
	calculateWithSlippageSell,
	getRandomInt,
	sendTx,
} from './util'
import type { PumpFun } from './IDL'
import { IDL } from './IDL'

const PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
const MPL_TOKEN_METADATA_PROGRAM_ID =
	'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'

export const GLOBAL_ACCOUNT_SEED = 'global'
export const MINT_AUTHORITY_SEED = 'mint-authority'
export const BONDING_CURVE_SEED = 'bonding-curve'
export const METADATA_SEED = 'metadata'

export const DEFAULT_DECIMALS = 6

export class PumpFunSDK {
	public program: Program<PumpFun>
	public connection: Connection
	constructor(provider?: Provider) {
		this.program = new Program<PumpFun>(IDL as PumpFun, provider)
		this.connection = this.program.provider.connection
	}

	async buy(
		buyer: Keypair,
		mint: PublicKey,
		buyAmountSol: bigint,
		slippageBasisPoints: bigint = 500n,
		priorityFees?: PriorityFee,
		commitment: Commitment = DEFAULT_COMMITMENT,
		finality: Finality = DEFAULT_FINALITY
	): Promise<TransactionResult> {
		let buyTx = await this.getBuyInstructionsBySolAmount(
			buyer.publicKey,
			mint,
			buyAmountSol,
			slippageBasisPoints,
			commitment
		)

		let buyResults = await sendTx(
			this.connection,
			buyTx,
			buyer.publicKey,
			[buyer],
			priorityFees,
			commitment,
			finality
		)
		return buyResults
	}

	async sell(
		seller: Keypair,
		mint: PublicKey,
		sellTokenAmount: bigint,
		slippageBasisPoints: bigint = 500n,
		priorityFees?: PriorityFee,
		commitment: Commitment = DEFAULT_COMMITMENT,
		finality: Finality = DEFAULT_FINALITY
	): Promise<TransactionResult> {
		let sellTx = await this.getSellInstructionsByTokenAmount(
			seller.publicKey,
			mint,
			sellTokenAmount,
			slippageBasisPoints,
			commitment
		)

		let sellResults = await sendTx(
			this.connection,
			sellTx,
			seller.publicKey,
			[seller],
			priorityFees,
			commitment,
			finality
		)
		return sellResults
	}

	async getBuyInstructionsBySolAmount(
		buyer: PublicKey,
		mint: PublicKey,
		buyAmountSol: bigint,
		slippageBasisPoints: bigint = 500n,
		commitment: Commitment = DEFAULT_COMMITMENT
	) {
		let bondingCurveAccount = await this._getBondingCurveAccount(
			mint,
			commitment
		)
		if (!bondingCurveAccount) {
			throw new Error(
				`Bonding curve account not found: ${mint.toBase58()}`
			)
		}

		let buyAmount = bondingCurveAccount.getBuyPrice(buyAmountSol)
		let buyAmountWithSlippage = calculateWithSlippageBuy(
			buyAmountSol,
			slippageBasisPoints
		)
		let globalAccount = await this.getGlobalAccount(commitment)

		return await this._getBuyInstructions(
			buyer,
			mint,
			globalAccount.feeRecipient,
			buyAmount,
			buyAmountWithSlippage
		)
	}

	//buy
	async _getBuyInstructions(
		buyer: PublicKey,
		mint: PublicKey,
		feeRecipient: PublicKey,
		amount: bigint,
		solAmount: bigint,
		commitment: Commitment = DEFAULT_COMMITMENT
	) {
		const associatedBondingCurve = await getAssociatedTokenAddress(
			mint,
			this.getBondingCurvePDA(mint),
			true
		)

		const associatedUser = await getAssociatedTokenAddress(
			mint,
			buyer,
			false
		)

		let transaction = new Transaction()

		try {
			await getAccount(this.connection, associatedUser, commitment)
		} catch (e) {
			transaction.add(
				createAssociatedTokenAccountInstruction(
					buyer,
					associatedUser,
					buyer,
					mint
				)
			)
		}

		transaction.add(
			await this.program.methods
				.buy(new BN(amount.toString()), new BN(solAmount.toString()))
				.accounts({
					feeRecipient: feeRecipient,
					mint: mint,
					associatedBondingCurve: associatedBondingCurve,
					associatedUser: associatedUser,
					user: buyer,
				})
				.transaction()
		)

		return transaction
	}

	//sell
	async getSellInstructionsByTokenAmount(
		seller: PublicKey,
		mint: PublicKey,
		sellTokenAmount: bigint,
		slippageBasisPoints: bigint = 9999n,
		commitment: Commitment = DEFAULT_COMMITMENT
	) {
		let bondingCurveAccount = await this._getBondingCurveAccount(
			mint,
			commitment
		)
		if (!bondingCurveAccount) {
			throw new Error(
				`Bonding curve account not found: ${mint.toBase58()}`
			)
		}

		let globalAccount = await this.getGlobalAccount(commitment)

		let minSolOutput = bondingCurveAccount.getSellPrice(
			sellTokenAmount,
			globalAccount.feeBasisPoints
		)

		let sellAmountWithSlippage = calculateWithSlippageSell(
			minSolOutput,
			slippageBasisPoints
		)

		return await this._getSellInstructions(
			seller,
			mint,
			globalAccount.feeRecipient,
			sellTokenAmount,
			sellAmountWithSlippage
		)
	}

	async _getSellInstructions(
		seller: PublicKey,
		mint: PublicKey,
		feeRecipient: PublicKey,
		amount: bigint,
		minSolOutput: bigint
	) {
		const associatedBondingCurve = await getAssociatedTokenAddress(
			mint,
			this.getBondingCurvePDA(mint),
			true
		)

		const associatedUser = await getAssociatedTokenAddress(
			mint,
			seller,
			false
		)

		let transaction = new Transaction()

		transaction.add(
			await this.program.methods
				.sell(
					new BN(amount.toString()),
					new BN(minSolOutput.toString())
				)
				.accounts({
					feeRecipient: feeRecipient,
					mint: mint,
					associatedBondingCurve: associatedBondingCurve,
					associatedUser: associatedUser,
					user: seller,
				})
				.transaction()
		)

		return transaction
	}

	async _getBondingCurveAccount(
		mint: PublicKey,
		commitment: Commitment = DEFAULT_COMMITMENT
	) {
		const tokenAccount = await this.connection.getAccountInfo(
			this.getBondingCurvePDA(mint),
			commitment
		)
		if (!tokenAccount) {
			return null
		}
		return BondingCurveAccount.fromBuffer(tokenAccount!.data)
	}

	async getGlobalAccount(commitment: Commitment = DEFAULT_COMMITMENT) {
		const [globalAccountPDA] = PublicKey.findProgramAddressSync(
			[Buffer.from(GLOBAL_ACCOUNT_SEED)],
			new PublicKey(PROGRAM_ID)
		)

		const tokenAccount = await this.connection.getAccountInfo(
			globalAccountPDA,
			commitment
		)

		return GlobalAccount.fromBuffer(tokenAccount!.data)
	}

	getBondingCurvePDA(mint: PublicKey) {
		return PublicKey.findProgramAddressSync(
			[Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
			this.program.programId
		)[0]
	}

	//EVENTS
	addEventListener<T extends PumpFunEventType>(
		eventType: T,
		callback: (
			event: PumpFunEventHandlers[T],
			slot: number,
			signature: string
		) => void
	) {
		return this.program.addEventListener(
			eventType,
			(event: any, slot: number, signature: string) => {
				let processedEvent
				switch (eventType) {
					case 'createEvent':
						processedEvent = toCreateEvent(event as CreateEvent)
						callback(
							processedEvent as PumpFunEventHandlers[T],
							slot,
							signature
						)
						break
					case 'tradeEvent':
						processedEvent = toTradeEvent(event as TradeEvent)
						callback(
							processedEvent as PumpFunEventHandlers[T],
							slot,
							signature
						)
						break
					case 'completeEvent':
						processedEvent = toCompleteEvent(event as CompleteEvent)
						callback(
							processedEvent as PumpFunEventHandlers[T],
							slot,
							signature
						)
						console.log('completeEvent', event, slot, signature)
						break
					case 'setParamsEvent':
						processedEvent = toSetParamsEvent(
							event as SetParamsEvent
						)
						callback(
							processedEvent as PumpFunEventHandlers[T],
							slot,
							signature
						)
						break
					default:
						console.error('Unhandled event type:', eventType)
				}
			}
		)
	}

	removeEventListener(eventId: number) {
		this.program.removeEventListener(eventId)
	}
}
