async function getAlchemyBalance(alchemy) {

    // Set wallet address
    const address = '0x87D90e540b541f44c7fE081EDC240c0D6FA924BD';

    // Get balance and format in terms of ETH
    let balance = await alchemy.core.getBalance(address, 'latest');
    return balance
}

export default getAlchemyBalance;