import { BLOCKCHAINS } from './addresses.js'

const v3 = document.getElementById('v3')
const native = document.getElementById('native')
let totalValueUSD = 0

function getCryptoBalance() {
    fetch('http://localhost:8000/cmc')  // Get token prices
        .then(response => response.json())
        .then(prices => {
            // TODO: get FTM V3 liqduity (KyberSwap)
            getDelegatedAVAX(prices)
            getUniswapLiquidity(prices)
            getNativeTokens(prices)
            getSPLiquidity(prices)
        })
}

function getNativeTokens(prices) {
    for (let [blockchainName, blockchain] of Object.entries(BLOCKCHAINS)) {
        let tokenSymbol = blockchain.nativeToken
        let row = native.insertRow(-1)
        row.insertCell(-1).innerHTML = tokenSymbol

        if (blockchainName === 'FANTOM') {
            fetch(`http://localhost:8000/quicknode`)
                .then(response => response.json())
                .then(qty => {
                    populateHTML(qty, prices, tokenSymbol, row)
                })
        } else if (blockchainName === 'AVALANCHE') {
            continue
        } else {
            fetch(`http://localhost:8000/alchemy?blockchainName=${blockchainName}&network=${blockchain.network}`)
                .then(response => response.json())
                .then(qty => {
                    populateHTML(qty, prices, tokenSymbol, row)
                })
        }
    }
}

function populateHTML(qty, prices, tokenSymbol, row) {
    qty = Number(qty)
    let value = qty * prices[tokenSymbol]
    totalValueUSD += value
    row.insertCell(-1).innerHTML = qty.toFixed(2)
    row.insertCell(-1).innerHTML = `$${value.toFixed(2)}`
}

function getSPLiquidity(prices) {

    fetch('http://localhost:8000/tokenSupply')
        .then(response => response.json())
        .then(dataTokens => {
            // Get pool balances
            fetch('http://localhost:8000/tokensAccount')
                .then(response => response.json())
                .then(tokens => {
                    let myLiquidity = prices['WFTM'] * tokens / Math.pow(10, 18) * 2 * 109.38 / (dataTokens / Math.pow(10, 18))
                    totalValueUSD += myLiquidity
                    let tableDataId = `#WFTM-BOO`
                    document.querySelector(tableDataId).innerHTML = `$${myLiquidity.toFixed(2)}`
                })
        })
}

function getUniUrls(blockchain, uniLidquidity) {
    const uniUrls = []
    let nfts = uniLidquidity.nfts
    nfts.forEach(
        nft => uniUrls.push(`http://localhost:8000/uni?tokenID=${nft}&network=${blockchain}`))
    return uniUrls
}

function getDelegatedAVAX(prices) {
    let deletgatedAvax = document.querySelector('#delegated-avax').innerHTML
    const delegatedAvaxValue = +(deletgatedAvax * prices.AVAX).toFixed(2)
    totalValueUSD += delegatedAvaxValue
    document.querySelector('#delegated-avax-val').innerHTML = `$${delegatedAvaxValue}`
}

function getUniswapLiquidity(prices) {
    for (let [blockchain, data] of Object.entries(BLOCKCHAINS)) {
        let uniLidquidity = data.liquidity?.uniswap
        if (uniLidquidity) {

            const uniUrls = getUniUrls(blockchain, uniLidquidity)
            Promise.all(uniUrls.map(url => fetch(url)
                .then(response => response.json())))
                .then(liquidityPools => {
                    liquidityPools.forEach(pool => {

                        let poolTokenValues = []
                        let row = v3.insertRow(-1)
                        row.insertCell(-1).innerHTML = Object.keys(pool).join(' / ')
                        row.insertCell(-1).innerHTML = 'UniSwap'

                        for (const [tokenSymbol, quantity] of Object.entries(pool)) {
                            poolTokenValues.push(quantity * prices[tokenSymbol])
                        }

                        let poolValue = poolTokenValues.reduce((previousValue, currentValue) => {
                            return previousValue + currentValue
                        }, 0)

                        poolTokenValues.forEach(value => {
                            let percentageOfPool = value / poolValue * 100
                            if (percentageOfPool > 85) {
                                row.style.color = 'yellow'
                            } else if (percentageOfPool > 99) {
                                row.style.color = 'red'
                            }
                            row.insertCell(-1).innerHTML = `${percentageOfPool.toFixed(0)}%`
                        })

                        totalValueUSD += poolValue
                        row.insertCell(-1).innerHTML = `$${poolValue.toFixed(2)}`

                    })

                    updateBal()

                })
        }
    }
}

function updateBal() {
    document.querySelector("#balance").innerHTML = `$${totalValueUSD.toFixed(2)}`
}

document.addEventListener('DOMContentLoaded', () => {
    getCryptoBalance()
})