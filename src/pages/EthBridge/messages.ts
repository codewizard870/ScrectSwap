import { NETWORKS } from '.';

export enum messages {
  swap_direction_source,
  swap_direction_dst,
  wallet,
  currency_symbol,
  secret_currency_symbol,
  image_logo,
  destination_network_address,
  full_name,
  token_name,
}

const message_map: Record<messages, Record<NETWORKS, string>> = {
  [messages.destination_network_address]: {
    [NETWORKS.ETH]: 'Destination ETH Address',
    [NETWORKS.BSC]: 'Destination BSC Address',
    [NETWORKS.PLSM]: 'Destination PLSM Addresss',
  },
  [messages.swap_direction_source]: {
    [NETWORKS.ETH]: 'ETH -> Secret Network',
    [NETWORKS.BSC]: 'BSC -> Secret Network',
    [NETWORKS.PLSM]: 'PLSM -> Secret Network',
  },
  [messages.swap_direction_dst]: {
    [NETWORKS.ETH]: 'Secret Network -> ETH',
    [NETWORKS.BSC]: 'Secret Network -> BSC',
    [NETWORKS.PLSM]: 'Secret Network -> PLSM',
  },
  [messages.wallet]: {
    [NETWORKS.ETH]: '(Metamask)',
    [NETWORKS.BSC]: '(Metamask)',
    [NETWORKS.PLSM]: '(Metamask)',
  },
  [messages.currency_symbol]: {
    [NETWORKS.ETH]: 'ETH',
    [NETWORKS.BSC]: 'BNB',
    [NETWORKS.PLSM]: 'PLM',
  },
  [messages.secret_currency_symbol]: {
    [NETWORKS.ETH]: 'secretETH',
    [NETWORKS.BSC]: 'secretBNB',
    [NETWORKS.PLSM]: 'secretPLM',
  },
  [messages.image_logo]: {
    [NETWORKS.ETH]: '/static/eth.svg',
    [NETWORKS.BSC]: '/static/binance-logo.png',
    [NETWORKS.PLSM]: '/static/plsm.png',
  },
  [messages.full_name]: {
    [NETWORKS.ETH]: 'Ethereum',
    [NETWORKS.BSC]: 'Binance Smart Chain',
    [NETWORKS.PLSM]: 'Plasm',
  },
  [messages.token_name]: {
    [NETWORKS.ETH]: 'ERC20',
    [NETWORKS.BSC]: 'BEP20',
    [NETWORKS.PLSM]: 'Parachain',
  },
};

export const messageToString = (msg: messages, network: NETWORKS): string => {
  return message_map[msg][network];
};
