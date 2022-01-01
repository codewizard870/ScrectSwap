const baseConfig = {
  ETH_GAS_LIMIT: 75000,
  SWAP_FEE: 750000,

  TEST_COINS: false,
  IS_MAINTENANCE: true,

  TRANSAK_URL: 'https://global.transak.com?apiKey=f0681ab5-7bd3-4cce-b86e-24cb05d670ec',
};

// This is a conditional require statement.  So if REACT_APP_NETWORK is 'mainnet' it will load mainnet.js
const networkConfig = require('./' + process.env.REACT_APP_NETWORK).config;

// Merge the baseConfig and the networkConfig into Typescript's global scope
globalThis.config = {...baseConfig, ...networkConfig};

// Necessary because create-react-app enforces isolatedModules
export {}
