import {NETWORKS} from '.';


export enum messages {
  swap_direction_source,
  swap_direction_dst,
  wallet,
  currency_symbol,
  secret_currency_symbol,
  image_logo,
  destination_network_address
}

const message_map: Record<messages, Record<NETWORKS, string>> = {
  [messages.destination_network_address]: {
    [NETWORKS.ETH]: "Destination ETH Address",
    [NETWORKS.BSC]: "Destination BSC Address",
  },
  [messages.swap_direction_source]: {
    [NETWORKS.ETH]: "ETH -> Secret Network",
    [NETWORKS.BSC]: "BSC -> Secret Network",
  },
  [messages.swap_direction_dst]: {
    [NETWORKS.ETH]: "Secret Network -> ETH",
    [NETWORKS.BSC]: "Secret Network -> BSC",
  },
  [messages.wallet]: {
    [NETWORKS.ETH]: "(Metamask)",
    [NETWORKS.BSC]: "(Metamask)",
  },
  [messages.currency_symbol]: {
    [NETWORKS.ETH]: "ETH",
    [NETWORKS.BSC]: "BNB",
  },
  [messages.secret_currency_symbol]: {
    [NETWORKS.ETH]: "secretETH",
    [NETWORKS.BSC]: "secretBNB",
  },
  [messages.image_logo]: {
    [NETWORKS.ETH]: "/static/eth.svg",
    [NETWORKS.BSC]: "/static/bnb.svg",
  }
}

export const messageToString = (msg: messages, network: NETWORKS): string => {
  return message_map[msg][network]
}