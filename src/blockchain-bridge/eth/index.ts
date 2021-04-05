import { EthMethods } from './EthMethods';
import { EthMethodsERC20 } from './EthMethodsERC20';
import { NETWORKS } from '../../pages/EthBridge';
import { TOKEN } from '../../stores/interfaces';

const Web3 = require('web3');

const web3URL = window.web3 ? window.web3.currentProvider : process.env.ETH_NODE_URL;

export const web3 = new Web3(web3URL);

const ethManagerJson = require('../out/MultiSigSwapWallet.json');

const ethManagerContract = new web3.eth.Contract(ethManagerJson.abi, process.env.ETH_MANAGER_CONTRACT);
const bscManagerContract = new web3.eth.Contract(ethManagerJson.abi, process.env.BSC_MANAGER_CONTRACT);
const plmManagerContract = new web3.eth.Contract(ethManagerJson.abi, process.env.PLSM_MANAGER_CONTRACT);

export const fromScrtMethods: Record<NETWORKS, Record<TOKEN, any>> = {
  [NETWORKS.PLSM]: {
    [TOKEN.NATIVE]: new EthMethods({
      web3: web3,
      ethManagerContract: plmManagerContract,
    }),
    [TOKEN.ERC20]: new EthMethodsERC20({
      web3: web3,
      ethManagerContract: plmManagerContract,
      ethManagerAddress: process.env.PLSM_MANAGER_CONTRACT,
    }),
    [TOKEN.S20]: null,
  },
  [NETWORKS.ETH]: {
    [TOKEN.NATIVE]: new EthMethods({
      web3: web3,
      ethManagerContract: ethManagerContract,
    }),

    [TOKEN.ERC20]: new EthMethodsERC20({
      web3: web3,
      ethManagerContract: ethManagerContract,
      ethManagerAddress: process.env.ETH_MANAGER_CONTRACT,
    }),
    [TOKEN.S20]: null,
  },
  [NETWORKS.BSC]: {
    [TOKEN.NATIVE]: new EthMethods({
      web3: web3,
      ethManagerContract: bscManagerContract,
    }),

    [TOKEN.ERC20]: new EthMethodsERC20({
      web3: web3,
      ethManagerContract: bscManagerContract,
      ethManagerAddress: process.env.BSC_MANAGER_CONTRACT,
    }),
    [TOKEN.S20]: null,
  },
};
