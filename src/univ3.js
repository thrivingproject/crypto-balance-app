/* 
 * const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/<RPC_Key>")
 * ERC20ABI = ERC20 json abi file
 * POOL = UniswapV3Pool
 * FACTORY = UniswapV3Factory
 * NFT = NonfungiblePositionManager
 */
import uniswap from '@uniswap/sdk'
import ethers from 'ethers'
import fs from "fs"
import Web3 from 'web3'


let amount0wei = 0
let amount1wei = 0
const ERC20Abi = fs.readFileSync('public/json/ERC20.json');
const POOL = fs.readFileSync(`public/json/poolABI.json`);
const ERC20 = JSON.parse(ERC20Abi);
const Q96 = uniswap.JSBI.exponentiate(uniswap.JSBI.BigInt(2), uniswap.JSBI.BigInt(96));
const FROM = '0x87D90e540b541f44c7fE081EDC240c0D6FA924BD'
const MAX = "340282366920938463463374607431768211455";   // MAX_VALUE UINT128


export async function getPositions(tokenId, providerURL) {
    const web3 = new Web3(new Web3.providers.HttpProvider(providerURL))
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

    const web3NFT = new web3.eth.Contract(
        JSON.parse(fs.readFileSync('public/json/UniV3NFT.json')),
        '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
    );

    const encoded = {
        "tokenId": tokenId,
        "recipient": FROM,
        "amount0Max": MAX,
        "amount1Max": MAX
    }

    const output = await web3NFT.methods
        .collect(encoded)
        .call()
        .catch(err => console.log(err))

    let position = await NFT.positions(tokenId);
    let token0contract = new ethers.Contract(position.token0, ERC20, provider);
    let token1contract = new ethers.Contract(position.token1, ERC20, provider);
    let token0sym = await token0contract.symbol();
    let token1sym = await token1contract.symbol();
    let T0d = await token0contract.decimals()
    let T1d = await token1contract.decimals()

    let poolContract = new ethers.Contract(
        await FACTORY.getPool(position.token0, position.token1, position.fee),
        JSON.parse(POOL),
        provider
    )

    let slot0 = await poolContract.slot0();
    let SqrtX96 = slot0.sqrtPriceX96.toString()
    let tickLow = position.tickLower
    let tickHigh = position.tickUpper
    let liquidity = position.liquidity.toString()

    let sqrtRatioA = Math.sqrt(1.0001 ** tickLow).toFixed(18);
    let sqrtRatioB = Math.sqrt(1.0001 ** tickHigh).toFixed(18);
    let currentTick = Math.floor(Math.log((SqrtX96 / Q96) ** 2) / Math.log(1.0001));
    let sqrtPrice = SqrtX96 / Q96;

    if (currentTick <= tickLow) {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
    }
    else if (currentTick > tickHigh) {
        amount1wei = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA));
    }
    else {
        amount0wei = Math.floor(liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
        amount1wei = Math.floor(liquidity * (sqrtPrice - sqrtRatioA));
    }

    let returnData = {
        [token0sym]: {
            liq: (amount0wei / (10 ** T0d)).toFixed(T0d),
            fee: (output.amount0 / (10 ** T0d)).toFixed(T0d)
        },
        [token1sym]: {
            liq: (amount1wei / (10 ** T1d)).toFixed(T1d),
            fee: (output.amount1 / (10 ** T1d)).toFixed(T1d)
        }
    }

    return returnData

}