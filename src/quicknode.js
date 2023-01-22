import { ethers } from "ethers";

async function getQuicknodeBalance(apiKey) {

    const provider = new ethers.providers.JsonRpcProvider(`https://necessary-flashy-morning.fantom.discover.quiknode.pro/${apiKey}/`);
    const balance = await provider.getBalance(
        "0x87D90e540b541f44c7fE081EDC240c0D6FA924BD",
        "latest"
    )
    return ethers.utils.formatEther(balance)
}

export default getQuicknodeBalance;
