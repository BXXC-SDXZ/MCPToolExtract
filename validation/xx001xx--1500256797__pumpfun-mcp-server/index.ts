import express from 'express'
import type { Router as ExpressRouter } from 'express'
import {
	splBalanceHandler,
	solBalanceHandler,
	createBuyTxHandler,
	createSellTxHandler,
} from './handlers'
import { config } from './config'
import { txStatusHandler } from './handlers/status'

try {
	config.validate()
} catch (error) {
	console.error('Configuration error:', error)
	process.exit(1)
}

const app = express()
const port = config.get('port')

const router: ExpressRouter = express.Router()

router.post('/balance/sol', solBalanceHandler)
router.post('/balance/spl', splBalanceHandler)
router.post('/pumpfun/buy', createBuyTxHandler)
router.post('/pumpfun/sell', createSellTxHandler)
router.post('/sol/txid', txStatusHandler)
app.use(express.json())
app.use(router)

app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
})
