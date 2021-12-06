import {
  IClaimProofDocument,
  INetworkBridgeHealth,
  IOperation,
  IRewardPool,
  ISecretSwapPair,
  ISecretSwapPool,
  ISecretToken,
  ISignerHealth,
  ISwap,
  ITokenInfo,
  tokenFromSecretToken,
} from '../stores/interfaces';
import * as agent from 'superagent';
import { SwapStatus } from '../constants';
import { ProxyTokens } from '../blockchain-bridge/eth/proxyTokens';
import { networkFromToken, NETWORKS } from '../blockchain-bridge';

//
// Map for override images for each token
//
const tokenImages = {
  'SSCRT': '/static/token-images/sscrt.svg',
  'SEFI': '/static/token-images/sefi.svg',
  'SIENNA': '/static/token-images/sienna.svg',
  'BAC': '/static/token-images/bac_ethereum.svg',
  'RENBTC': '/static/token-images/renbtc_ethereum.svg',
  'DPI': '/static/token-images/dpi_ethereum.svg',
  'UNILP-WSCRT-ETH': '/static/token-images/unilp_ethereum.svg',
  'RUNE': '/static/token-images/rune_ethereum.svg',
  'MANA': '/static/token-images/mana_ethereum.svg',
  'YFL': '/static/token-images/yfl_ethereum.svg',
  'BNB(BSC)': '/static/token-images/bnb_binance.svg',
  'ETH': '/static/token-images/eth_ethereum.svg',
  'USDT': '/static/token-images/usdt_ethereum.svg',
  'DAI': '/static/token-images/dai_ethereum.svg',
  'COMP': '/static/token-images/comp_ethereum.svg',
  'UNI': '/static/token-images/uni_ethereum.svg',
  'YFI': '/static/token-images/yfi_ethereum.svg',
  'TUSD': '/static/token-images/tusd_ethereum.svg',
  'OCEAN': '/static/token-images/ocean_ethereum.svg',
  'LINK': '/static/token-images/link_ethereum.svg',
  'MKR': '/static/token-images/mkr_ethereum.svg',
  'SNX': '/static/token-images/snx_ethereum.svg',
  'BAND': '/static/token-images/band_ethereum.svg',
  'KNC': '/static/token-images/knc_ethereum.svg',
  'AAVE': '/static/token-images/aave_ethereum.svg',
  'WBTC': '/static/token-images/wbtc_ethereum.svg',
  'REN': '/static/token-images/ren_ethereum.svg',
  'SUSHI': '/static/token-images/sushi_ethereum.svg',
  'RSR': '/static/token-images/rsr_ethereum.svg',
  'USDC': '/static/token-images/usdc_ethereum.svg',
  'TORN': '/static/token-images/torn_ethereum.svg',
  'BAT': '/static/token-images/bat_ethereum.svg',
  'ZRX': '/static/token-images/zrx_ethereum.svg',
  'ENJ': '/static/token-images/enj_ethereum.svg',
  'ALPHA': '/static/token-images/alpha_ethereum.svg',
  'BUSD(BSC)': '/static/token-images/busd_binance.svg',
  'ETH(BSC)': '/static/token-images/eth_binance.svg',
  'XRP(BSC)': '/static/token-images/xrp_binance.svg',
  'USDT(BSC)': '/static/token-images/usdt_binance.svg',
  'ADA(BSC)': '/static/token-images/ada_binance.svg',
  'DOGE(BSC)': '/static/token-images/doge_binance.svg',
  'DOT(BSC)': '/static/token-images/dot_binance.svg',
  'USDC(BSC)': '/static/token-images/usdc_binance.svg',
  'BCH(BSC)': '/static/token-images/bch_binance.svg',
  'LTC(BSC)': '/static/token-images/ltc_binance.svg',
  'LINK(BSC)': '/static/token-images/link_binance.svg',
  'TRX(BSC)': '/static/token-images/trx_binance.svg',
  'CAKE': '/static/token-images/cake_binance.svg',
  'BAKE': '/static/token-images/bake_binance.svg',
  'XVS': '/static/token-images/xvs_binance.svg',
  'LINA': '/static/token-images/lina_binance.svg',
  'FINE': '/static/token-images/fine_binance.svg',
  'BUNNY': '/static/token-images/bunny_binance.svg',
  'XMR': '/static/sXMR.png'
}

//
// Custom token labels
//
const tokenLabels = {
  'BAKE': 'BAKE(BSC)',
  'BUNNY': 'BUNNY(BSC)',
  'CAKE': 'CAKE(BSC)',
  'FINE': 'FINE(BSC)',
  'LINA': 'LINA(BSC)',
  'XVS': 'XVS(BSC)'
}

const availableNetworks = [NETWORKS.ETH, NETWORKS.BSC]; //, NETWORKS.PLSM

const BACKENDS = {
  [NETWORKS.ETH]: process.env.BACKEND_URL,
  [NETWORKS.BSC]: process.env.BSC_BACKEND_URL,
  [NETWORKS.PLSM]: process.env.PLSM_BACKEND_URL,
};

const backendUrl = (network: NETWORKS, url) => {
  return `${BACKENDS[network]}${url}`;
};

export const getSushiPool = async (address: String) => {
  const res = await agent.get<any>(process.env.SUSHI_API).query({ address });
  return res.body;
};

export const createOperation = async (network: NETWORKS, params) => {
  const url = backendUrl(network, `/operations`);

  const res = await agent.post<IOperation>(url, params);

  return res.body;
};

export const updateOperation = async (network: NETWORKS, id: string, transactionHash: string) => {
  const url = backendUrl(network, `/operations/${id}`);

  const res = await agent.post<IOperation>(url, { transactionHash });

  return res.body;
};

export const getStatus = async (params): Promise<SwapStatus> => {
  const url = backendUrl(params.network, `/operations/${params.id}`);

  const res = await agent.get<IOperation>(url);

  if (res.body.swap) {
    return SwapStatus[SwapStatus[res.body.swap.status]];
  } else {
    return SwapStatus[SwapStatus[res.body.operation.status]];
  }
};

export const getOperation = async (network: NETWORKS, params): Promise<{ operation: IOperation; swap: ISwap }> => {
  const url = backendUrl(network, `/operations/${params.id}`);

  const res = await agent.get<{ body: { operation: IOperation; swap: ISwap } }>(url);

  return res.body;
};

export const getSwap = async (network: NETWORKS, id: string): Promise<IOperation> => {
  const url = backendUrl(network, `/swaps/${id}`);

  const res = await agent.get<{ body: IOperation }>(url);

  return res.body;
};

export const getOperations = async (params: any): Promise<{ content: ISwap[] }> => {
  //const url = backendUrl(params.network, '/swaps/');

  const urls = [];
  for (const network of availableNetworks) {
    urls.push(backendUrl(network, '/swaps/'));
  }

  let res = await Promise.all([
    ...urls.map(url => {
      return agent.get<{ body: { swaps: ISwap[] } }>(url, params);
    }),
  ]);

  //const res = await agent.get<{ body: ISwap[] }>(url, params);
  const swapArray: ISwap[] = res.flatMap(t => t.body.swaps)
    .sort((a, b) => {return (a.created_on > b.created_on ? -1 : 1);});
  // const content = res.body.swaps;

  return { content: swapArray };
};

export const getTokensInfo = async (params: any): Promise<{ content: ITokenInfo[] }> => {
  let urls = [];
  let secretTokenUrls = [];
  // fuck typescript Enums
  for (const network of availableNetworks) {
    urls.push(backendUrl(network, '/tokens/'));
  }
  secretTokenUrls.push(backendUrl(NETWORKS.ETH, '/secret_tokens/'));
  //console.log(`urls: ${JSON.stringify(urls)}`);
  //console.log(`secretTokenUrls: ${JSON.stringify(secretTokenUrls)}`);
  //const secretTokenListUrl = backendUrl('/secret_tokens/');

  let tokens = await Promise.all([
    ...urls.map(url => {
      return agent.get<{ body: { tokens: ITokenInfo[] } }>(url, params);
    }),
  ]);

  let secretTokens = await Promise.all(
    secretTokenUrls.map(secretTokenListUrl => {
      return agent.get<{ body: { tokens: ISecretToken[] } }>(secretTokenListUrl, params);
    }),
  );

  const tokenArray: ITokenInfo[] = tokens.flatMap(t => t.body.tokens);
  try {
    let content = tokenArray
      .filter(t => (process.env.TEST_COINS ? true : !t.display_props?.hidden))
      .map(t => {
        if (t.display_props.proxy ) {
          try {
            t.display_props.proxy_address = t.dst_address;
            const proxyToken = ProxyTokens[t.display_props.symbol.toUpperCase()][networkFromToken(t)];
            t.dst_address = proxyToken.token;
            t.display_props.proxy_symbol = proxyToken.proxySymbol;

          } catch (error) {
            console.log('Failed to parse proxy '+t.display_props.symbol.toUpperCase())
          }
        }

        // Overide the image for each token
        if (tokenImages[t.display_props.symbol]) {
          t.display_props.image = tokenImages[t.display_props.symbol]
        }

        // Overide the lable for each token
        if (tokenLabels[t.display_props.symbol]) {
          t.display_props.symbol = tokenLabels[t.display_props.symbol]
        }

        return t;
      })
      .map(t => {
        if (t.display_props?.usage === undefined) {
          t.display_props.usage = ['BRIDGE', 'REWARDS', 'SWAP'];
        }
        //t.display_props.symbol = t.display_props.symbol.split('(')[0];
        return t;
      });
    const secretTokenArray: ISecretToken[] = secretTokens.flatMap(t => t.body.tokens);

    let sTokens = secretTokenArray.map(t => {
      return tokenFromSecretToken(t);
    });

    content.push(...sTokens);

    return { content };
  } catch (e) {
    console.error(e);
    return { content: undefined };
  }
};

export const getSecretSwapPairs = async (params: any): Promise<{ content: ISecretSwapPair[] }> => {
  const url = backendUrl(NETWORKS.ETH, '/secretswap_pairs/');

  const res = await agent.get<{ body: ISecretSwapPair[] }>(url, params);

  const content = res.body.pairs;

  return { content: content };
};

export const getSecretSwapPools = async (params: any): Promise<{ content: ISecretSwapPool[] }> => {
  const url = backendUrl(NETWORKS.ETH, '/secretswap_pools/');

  const res = await agent.get<{ body: ISecretSwapPool[] }>(url, params);

  const content = res.body.pools;

  return { content: content };
};

export const getSignerHealth = async (): Promise<{ content: INetworkBridgeHealth[] }> => {
  // const url = backendUrl(NETWORKS.ETH, '/signer_health/');

  let urls = [];

  for (const network of availableNetworks) {
    urls.push({ network: network, url: backendUrl(network, '/signer_health/') });
  }

  let healthResponses = await Promise.all([
    ...urls.map(async url => {
      return { network: url.network, result: await agent.get<{ body: { health: ISignerHealth[] } }>(url.url, {}) };
    }),
  ]);

  // const content = Object.assign(
  //   {},
  //   ...
  // );

  const content = healthResponses.map(response => {
    return { network: response.network, health: response.result.body.health };
  });

  return { content: content };
};

// pools that are not deprecated, but the rewards are 0
const zeroPools = {
  'LP-sSCRT-SLINK': true,
  'LP-sSCRT-SDOT(BSC)': true,
  'LP-sSCRT-SDAI': true,
  'LP-sSCRT-SMANA': true,
  'LP-sSCRT-SOCEAN': true,
  'LP-sSCRT-SRSR': true,
  'LP-sSCRT-SUNI': true,
  'LP-sSCRT-SYFI': true
}

export const getRewardsInfo = async (params: any): Promise<{ content: IRewardPool[] }> => {
  const url = backendUrl(NETWORKS.ETH, '/rewards/');

  const res = await agent.get<{ body: { tokens: IRewardPool[] } }>(url, params);

  const content = res.body.pools;

  // if it's in the zeroPools list, set the zero flag
  for(let pool of content) {
    if(!pool.deprecated && zeroPools[pool.inc_token.symbol])
      pool.zero = true;
  }

  return { ...res.body, content };
};

export const getEthProof = async (addr: string): Promise<{ proof: IClaimProofDocument }> => {
  const url = backendUrl(NETWORKS.ETH, `/proof/eth/${addr.toLowerCase()}`);
  const res = await agent.get<{ body: IClaimProofDocument }>(url);

  return res.body;
};

export const getScrtProof = async (addr): Promise<{ proof: IClaimProofDocument }> => {
  const url = backendUrl(NETWORKS.ETH, `/proof/scrt/${addr.toLowerCase()}`);

  const res = await agent.get<{ body: IClaimProofDocument }>(url);

  return res.body;
};
