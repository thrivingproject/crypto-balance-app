import { BLOCKCHAINS } from './addresses.js'

const v3 = document.getElementById('v3')
let totalValueUSD = 0

function getCryptoBalance() {
    fetch('http://localhost:8000/cmc')  // Get token prices
        .then(response => response.json())
        .then(data => {

            // TODO: get FTM V3 liqduity (KyberSwap)
            tickerTape(data.changes)
            getDelegatedAVAX(data.prices)
            getUniswapLiquidity(data.prices)
            getNativeTokens(data.prices)
            // getSPLiquidity(prices)
        })
}

function tickerTape(prices) {
    const ignoreSymbols = ['USDC', 'BOO', 'JOE', 'WETH', 'WMATIC', 'WFTM']
    const nativeTokens = []
    const altTokens = []
    let css = 'style="margin: 0; padding: .25rem; width: 15%; border: solid 1px"'
    for (const [symbol, data] of Object.entries(prices)) {
       
        const priceNum = Number(data.price)
        let formattedPrice;
        if (priceNum < 1) {
            formattedPrice = data.price.toFixed(3)
        } else if (priceNum < 100) {
            formattedPrice = data.price.toFixed(2)
        } else {
            formattedPrice = data.price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }

        let percent_change_24h = Number(data.percent_change_24h).toFixed(2)
        let percent_change_color = percent_change_24h < 0 ? '#F34F4E' : '#229F75'
        let changeTag = `<p style="color: ${percent_change_color}">${percent_change_24h}%`
        let priceTag = `<p>${symbol}: $${formattedPrice}</p>`
        let quote = `<div ${css}>${priceTag}${changeTag}</div>`

        if (!ignoreSymbols.includes(symbol)) {
            if (['WBTC', 'ETH', 'OP', 'FTM', 'MATIC', 'AVAX'].includes(symbol)) {
                nativeTokens.push(quote)
            } else {
                altTokens.push(quote)
            }
        }
    }
    const nativePriceString = nativeTokens.join('\t')
    const altPriceString = altTokens.join('\t')
    document.getElementById('tape-native').innerHTML = nativePriceString
    document.getElementById('tape-alt').innerHTML = altPriceString
}

function getNativeTokens(prices) {
    for (let [blockchainName, blockchain] of Object.entries(BLOCKCHAINS)) {

        let tokenSymbol = blockchain.nativeToken
        let row = document.getElementById('single-exposure').insertRow(-1)
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

// function getSPLiquidity(prices) {

//     fetch('http://localhost:8000/tokenSupply')
//         .then(response => response.json())
//         .then(dataTokens => {
//             // Get pool balances
//             fetch('http://localhost:8000/tokensAccount')
//                 .then(response => response.json())
//                 .then(tokens => {
//                     let myLiquidity = prices['WFTM'] * tokens / Math.pow(10, 18) * 2 * 109.38 / (dataTokens / Math.pow(10, 18))
//                     totalValueUSD += myLiquidity
//                     let tableDataId = `#WFTM-BOO`
//                     document.querySelector(tableDataId).innerHTML = `$${myLiquidity.toFixed(2)}`
//                 })
//         })
// }

function getUniUrls(blockchain, uniLidquidity) {
    const uniUrls = []
    let nfts = uniLidquidity.nfts
    nfts.forEach(
        nft => uniUrls.push(`http://localhost:8000/uni?tokenID=${nft}&network=${blockchain}`))
    return uniUrls
}

function getUniswapLiquidity(prices) {
    for (let [blockchain, data] of Object.entries(BLOCKCHAINS)) {
        let uniLidquidity = data.liquidity?.uniswap
        if (uniLidquidity) {

            const uniUrls = getUniUrls(blockchain, uniLidquidity)
            Promise.all(uniUrls.map(url => fetch(url)
                .then(response => response.json())))
                .then(data => {

                    data.forEach(position => {
                        let poolTokenValues = []
                        let row = v3.insertRow(-1)
                        row.insertCell(-1).innerHTML = Object.keys(position.liquidity).join(' / ')
                        row.insertCell(-1).innerHTML = `<a target="_blank" href="https://app.uniswap.org/#/pool/${position.nft}">Uniswap</a>`

                        for (const [tokenSymbol, quantity] of Object.entries(position.liquidity)) {
                            poolTokenValues.push(quantity * prices[tokenSymbol])
                        }

                        let poolValue = poolTokenValues.reduce((previousValue, currentValue) => {
                            return previousValue + currentValue
                        }, 0)

                        poolTokenValues.forEach(value => {
                            let percentageOfPool = value / poolValue * 100
                            if (percentageOfPool > 90) {
                                row.style.color = 'red'
                            } else if (percentageOfPool > 75) {
                                row.style.color = 'yellow'
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

function getDelegatedAVAX(prices) {
    let deletgatedAvax = document.querySelector('#delegated-avax').innerHTML
    const delegatedAvaxValue = +(deletgatedAvax * prices.AVAX).toFixed(2)
    totalValueUSD += delegatedAvaxValue
    document.querySelector('#delegated-avax-val').innerHTML = `$${delegatedAvaxValue}`
}

document.addEventListener('DOMContentLoaded', () => {
    getCryptoBalance()
})