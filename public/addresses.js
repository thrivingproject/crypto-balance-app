const metamask = '0x87D90e540b541f44c7fE081EDC240c0D6FA924BD'

const BLOCKCHAINS = {
    AVALANCHE: {
        wallets: ['0xc1a9bbc47232d2db538ae8be8e88e61fe9ed09d9', metamask],
        liquidity: {},
        provider: 'https://avalanche-mainnet.infura.io/v3/',
        nativeToken: 'AVAX'
    },
    FANTOM: {
        wallets: [metamask],
        explorer: {
            endpoint: 'https://api.ftmscan.com/api',
        },
        liquidity: {
            spookyswap: {
                0: {
                    spLP: '0xEc7178F4C41f346b2721907F5cF7628E388A7a58',
                    pair: ['WFTM', 'BOO'],
                    owed: 0
                },
            }
        },
        erc20: {
            USDC: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75',
            WFTM: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
            BOO: '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE'
        },
        provider: 'https://necessary-flashy-morning.fantom.discover.quiknode.pro/',
        nativeToken: 'FTM'
    },
    POLYGON: {
        wallets: [metamask],
        liquidity: {
            uniswap: {
                nfts: [
                    668922,  // MATIC / WETH
                    667734,  // MATIC / WBTC
                    662516  // CRV / WETH
                ]
            }
        },
        provider: 'https://polygon-mainnet.g.alchemy.com/v2/',
        network: 'MATIC_MAINNET',
        nativeToken: 'MATIC'
    },
    OPTIMISM: {
        wallets: [metamask],
        liquidity: {
            uniswap: {
                nfts: [297991, 298216]
            }
        },
        provider: 'https://opt-mainnet.g.alchemy.com/v2/',
        network: 'OPT_MAINNET',
        nativeToken: 'ETH'
    }
}

export { BLOCKCHAINS }