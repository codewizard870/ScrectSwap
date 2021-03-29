import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
import { ethToWei, getGasPrice } from './helpers';
const BN = require('bn.js');

export interface EthMethodsSefiInitParams {
  web3: Web3;
  govTokenContract: Contract;
  distributionContract: Contract;
}

export class EthMethodsSefi {
  private web3: Web3;
  private govTokenContract: Contract;
  private distributionContract: Contract;

  constructor(params: EthMethodsSefiInitParams) {
    this.web3 = params.web3;
    this.govTokenContract = params.govTokenContract;
    this.distributionContract = params.distributionContract;
  }

  claimToken = async (sendTxCallback?) => {
    // @ts-ignore
    const accounts = await ethereum.enable();

    const estimateGas = await this.distributionContract.methods.claim().estimateGas({
      from: accounts[0],
    });

    const gasLimit = Math.max(estimateGas + estimateGas * 0.3, Number(process.env.ETH_GAS_LIMIT));

    return await this.distributionContract.methods.claim().send({
      from: accounts[0],
      gas: new BN(gasLimit),
      gasPrice: await getGasPrice(this.web3),
    });
  };

  checkAvailableToClaim = async (index: number) => {
    return await this.distributionContract.methods.isClaimed(new BN(index)).call();
  };

  checkGovBalance = async addr => {
    return await this.govTokenContract.methods.balanceOf(addr).call();
  };
}
