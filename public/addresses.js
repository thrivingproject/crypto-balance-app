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
                    682550,  // Matic - AAVE
                    684915  // crv-eth
                ]
            }
        },
        provider: 'https://polygon-mainnet.g.alchemy.com/v2/',
        network: 'MATIC_MAINNET',
        nativeToken: 'MATIC',
        erc20: {
            CRV: {
                address: '0x172370d5Cd63279eFa6d502DAB29171933a610AF',
                numDecimals: 18
            },
            AAVE: {
                address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
                numDecimals: 18
            }
        }
    },
    OPTIMISM: {
        wallets: [metamask],
        liquidity: {
            uniswap: {
                nfts: [
                    304080,  // velo-eth
                    304088   // op-eth
                ]
            }
        },
        provider: 'https://opt-mainnet.g.alchemy.com/v2/',
        network: 'OPT_MAINNET',
        nativeToken: 'ETH',
        erc20: {
            USDC: {
                address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
                numDecimals: 6
            },
            VELO: {
                address: '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',
                numDecimals: 18
            },
            OP: {
                address: '0x4200000000000000000000000000000000000042',
                numDecimals: 18
            }
        }
    }
}

export { BLOCKCHAINS }