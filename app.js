import path from 'path';
import { fileURLToPath } from 'url';
import { Alchemy, Utils, Network } from "alchemy-sdk";
import axios from 'axios'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { getPositions } from './src/univ3.js'
import getAlchemyBalance from "./src/alchemy.js";
import getQuicknodeBalance from "./src/quicknode.js";
import { BLOCKCHAINS } from "./public/addresses.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 8000
const app = express()
app.use(cors())
app.use(express.static(__dirname))
dotenv.config()
const ftmApi = process.env.FTMSCAN_API

// Set true for mock CoinMarketCap quotes to save API credits
const DEV = false


app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Get Uniswap balances
app.get('/uni', (req, res) => {

    let response = null
    new Promise(async (resolve, reject) => {

        let tokenID = req.query.tokenID
        let network = req.query.network
        let key = network === 'MATIC' ?
            process.env.POLYGON_ALCHEMY_KEY
            : process.env.OPTIMISM_ALCHEMY_KEY
        let providerURL = BLOCKCHAINS[network].provider + key

        try {
            response = await getPositions(tokenID, providerURL)
            resolve(res.json({ liquidity: response, nft: tokenID }))
        } catch (ex) {
            console.log(ex);
            reject(ex)
        }

    })

})

// Get CoinMarketCap quotes
app.get('/cmc', (req, res) => {

    let response = null;
    new Promise(async (resolve, reject) => {

        try {
            if (!DEV) {
                response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=5805,3513,11396,9608,3890,8925,3408,2396,7083,6538,3717,1027,11840,10240,20435,8000', {
                    headers: {
                        'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
                    },
                })
            } else {
                response = await axios.get('https://sandbox-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=5805,3513,9608,3890,8925,3408,2396', {
                    headers: {
                        'X-CMC_PRO_API_KEY': 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c',
                    },
                })
            }
        } catch (ex) {
            response = null;
            console.log(ex);
            reject(ex);
        }

        if (response) {
            let quotes = {}
            let changes = {}
            for (const value of Object.values(response.data.data)) {
                quotes[value.symbol] = value.quote.USD.price
                changes[value.symbol] = {
                    price: value.quote.USD.price,
                    percent_change_24h: value.quote.USD.percent_change_24h
                }
            }
            res.json({prices: quotes, changes: changes})
        }

    })

})

// Get Polygon and Optimism data via Alchemy
app.get('/alchemy', (req, res) => {

    let re = null
    let apiKey;
    let blockchainName = req.query.blockchainName
    let network = req.query.network

    switch (blockchainName) {
        case 'POLYGON':
            apiKey = process.env.POLYGON_ALCHEMY_KEY
            break
        case 'OPTIMISM':
            apiKey = process.env.OPTIMISM_ALCHEMY_KEY
            break
        default:
            break
    }

    const settings = {
        apiKey: apiKey,
        network: Network[network]
    }

    const alchemy = new Alchemy(settings)
    new Promise(async (resolve, reject) => {
        try {
            re = await getAlchemyBalance(alchemy)
            let bal = Utils.formatEther(re)
            resolve(res.json(bal))
        } catch (e) {
            re = null
            console.log(e);
            reject(e)
        }
    })
})

// Get Fantom data via QuickNode
app.get('/quicknode', (req, res) => {
    let re = null
    let apiKey = process.env.QUICKNODE_TOKEN
    new Promise(async (resolve, reject) => {
        try {
            re = await getQuicknodeBalance(apiKey)
            resolve(res.json(re))
        } catch (e) {
            re = null
            console.log(e);
            reject(e)
        }
    })
})

// Spookywap fantom contract token supply
app.get('/tokenSupply', (req, res) => {
    const tokenSupplyURL = 'https://api.ftmscan.com/api'
        + '?module=stats'
        + '&action=tokensupply'
        + `&contractaddress=0xEc7178F4C41f346b2721907F5cF7628E388A7a58`
        + `&apikey=${ftmApi}`

    let re = null
    new Promise(async (resolve, reject) => {
        try {
            re = await axios.get(tokenSupplyURL)
            resolve(res.json(re.data.result))
        } catch (e) {
            re = null
            console.log(e);
            reject(e)
        }
    })
})

// Spookyswap fantom pool account balance
app.get('/tokensAccount', (req, res) => {
    const tokenAccountURL = 'https://api.ftmscan.com/api'
        + '?module=account'
        + '&action=tokenbalance'
        + `&contractaddress=0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83`
        + `&address=0xEc7178F4C41f346b2721907F5cF7628E388A7a58`
        + `&tag=latest`
        + `&apikey=${ftmApi}`

    let re = null
    new Promise(async (resolve, reject) => {
        try {
            re = await axios.get(tokenAccountURL)
            resolve(res.json(re.data.result))
        } catch (e) {
            re = null
            console.log(e);
            reject(e)
        }
    })
})

// Server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})