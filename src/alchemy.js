// Provide for Polygon and Optimism 
import { Utils } from "alchemy-sdk";
import { BLOCKCHAINS } from "../public/addresses.js";

async function getAlchemyBalance(alchemy, blockchainName) {

    // Set wallet address
    const wallet = '0x87D90e540b541f44c7fE081EDC240c0D6FA924BD';

    // Get native token balance
    let nativeTokenBalance = await alchemy.core.getBalance(wallet, 'latest');

    // Get ERC-20 balances
    let erc20Tokens = {}
    for (let [token, profile] of Object.entries(BLOCKCHAINS[blockchainName].erc20)) {
        let balance = await alchemy.core.getTokenBalances(wallet, [profile.address])
        balance = balance['tokenBalances'][0]['tokenBalance'];
        balance = (parseInt(balance) / 10 ** profile.numDecimals).toFixed(2);
        erc20Tokens[token] = balance
    }

    return {
        nativeTokenBalance: Utils.formatEther(nativeTokenBalance),
        erc20Tokens
    }
}

export default getAlchemyBalance;