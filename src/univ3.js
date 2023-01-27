/* 
 * const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/<RPC_Key>")
 * ERC20ABI = ERC20 json abi file
 * POOL = UniswapV3Pool
 * FACTORY = UniswapV3Factory
 * NFT = NonfungiblePositionManager
 */
import uniswap from '@uniswap/sdk'
import ethers from 'ethers'
import fs from "fs";

let amount0wei = 0
let amount1wei = 0
const ERC20Abi = fs.readFileSync('public/json/ERC20.json');
const POOL = fs.readFileSync(`public/json/poolABI.json`);
const ERC20 = JSON.parse(ERC20Abi);
const Q96 = uniswap.JSBI.exponentiate(uniswap.JSBI.BigInt(2), uniswap.JSBI.BigInt(96));

export async function getPositions(tokenId, providerURL) {

    const provider = new ethers.providers.JsonRpcProvider(providerURL)
    const FACTORY = new ethers.Contract(
        '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        JSON.parse(fs.readFileSync('public/json/V3factory.json')),
        provider
    )

    const NFT = new ethers.Contract(
        '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
        JSON.parse(fs.readFileSync('public/json/UniV3NFT.json')),
        provider
    );

    let position = await NFT.positions(tokenId);
    let token0contract = new ethers.Contract(position.token0, ERC20, provider);
    let token1contract = new ethers.Contract(position.token1, ERC20, provider);
    let token0sym = await token0contract.symbol();
    let token1sym = await token1contract.symbol();

    let poolContract = new ethers.Contract(
        await FACTORY.getPool(position.token0, position.token1, position.fee),
        JSON.parse(POOL),
        provider
    )

    let slot0 = await poolContract.slot0();

    let data = {
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

    let sqrtRatioA = Math.sqrt(1.0001 ** data.tickLow).toFixed(18);
    let sqrtRatioB = Math.sqrt(1.0001 ** data.tickHigh).toFixed(18);
    let currentTick = Math.floor(Math.log((data.SqrtX96 / Q96) ** 2) / Math.log(1.0001));
    let sqrtPrice = data.SqrtX96 / Q96;

    if (currentTick <= data.tickLow) {
        amount0wei = Math.floor(data.liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
    }
    else if (currentTick > data.tickHigh) {
        amount1wei = Math.floor(data.liquidity * (sqrtRatioB - sqrtRatioA));
    }
    else {
        amount0wei = Math.floor(data.liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
        amount1wei = Math.floor(data.liquidity * (sqrtPrice - sqrtRatioA));
    }

    return {
        [data.token0sym]: (amount0wei / (10 ** data.T0d)).toFixed(data.T0d),
        [data.token1sym]: (amount1wei / (10 ** data.T1d)).toFixed(data.T1d),
    }

}