import { createRequire } from "module";
const require = createRequire(import.meta.url);
const uniswap = require('@uniswap/sdk')
const ethers = require('ethers')
const fs = require('fs')
let [amount0wei, amount1wei] = [0, 0]
const ERC20Abi = fs.readFileSync('public/json/ERC20.json');   // ERC20 json abi file
const ERC20 = JSON.parse(ERC20Abi);
const Q96 = uniswap.JSBI.exponentiate(uniswap.JSBI.BigInt(2), uniswap.JSBI.BigInt(96));
// const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/<RPC_Key>")

async function getPositions(nft, providerURL) {
    const provider = new ethers.providers.JsonRpcProvider(providerURL)

    const pool = fs.readFileSync(`public/json/poolABI.json`);  // V3 pool abi json file
    let data = await getData(nft);
    let tokens = await getTokenAmounts(data.liquidity, data.SqrtX96, data.tickLow, data.tickHigh, data.T0d, data.T1d);

    async function getData(tokenID) {

        let FactoryContract = new ethers.Contract(
            '0x1F98431c8aD98523631AE4a59f267346ea31F984',
            JSON.parse(fs.readFileSync('public/json/V3factory.json')),  // V3 factory abi json
            provider
        )

        let NFTContract = new ethers.Contract(
            '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
            JSON.parse(fs.readFileSync('public/json/UniV3NFT.json')),  // NFT contract abi
            provider
        );

        let position = await NFTContract.positions(tokenID);
        let token0contract = new ethers.Contract(position.token0, ERC20, provider);
        let token1contract = new ethers.Contract(position.token1, ERC20, provider);
        let token0sym = await token0contract.symbol();
        let token1sym = await token1contract.symbol();

        let poolContract = new ethers.Contract(
            await FactoryContract.getPool(position.token0, position.token1, position.fee),
            JSON.parse(pool),
            provider
        )

        let slot0 = await poolContract.slot0();

        let dict = {
            "SqrtX96": slot0.sqrtPriceX96.toString(),
            "Pair": token0sym + "/" + token1sym,
            "T0d": await token0contract.decimals(),
            "T1d": await token1contract.decimals(),
            "tickLow": position.tickLower,
            "tickHigh": position.tickUpper,
            "liquidity": position.liquidity.toString(),
            'token0sym': token0sym,
            'token1sym': token1sym
        }

        return dict

    }

    async function getTokenAmounts(liquidity, sqrtPriceX96, tickLow, tickHigh, token0Decimal, token1Decimal) {

        let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
        let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);
        let currentTick = Math.floor(Math.log((sqrtPriceX96 / Q96) ** 2) / Math.log(1.0001));
        let sqrtPrice = sqrtPriceX96 / Q96;

        if (currentTick <= tickLow) {
            amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
        }
        else if (currentTick > tickHigh) {
            amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
        }
        else {  // (currentTick >= tickLow && currentTick < tickHigh)
            amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
            amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
        }

        return [
            (amount0wei / (10 ** token0Decimal)).toFixed(token0Decimal),
            (amount1wei / (10 ** token1Decimal)).toFixed(token1Decimal)
        ]

    }

    return {
        [data.token0sym]: tokens[0],
        [data.token1sym]: tokens[1],
    }

}

// module.exports = { getPositions: getPositions }
export default getPositions;