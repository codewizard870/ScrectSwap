import { SigningCosmWasmClient } from 'secretjs';
import { Claim, ethMethodsSefi, isClaimedSefiRewardsScrt } from '../../../blockchain-bridge';
import BigNumber from 'bignumber.js';
import * as services from 'services';

interface ClaimInfo {
  address: string;
  amount: BigNumber;
  isClaimed: false
}

export const claimScrt = async (secretjs: SigningCosmWasmClient, address: string) => {
  const result = await Claim({ secretjs, address });

  return result;
};

export const claimErc = async () => await ethMethodsSefi.claimToken();

export const claimInfoErc = async (address) => {
  const info = (await services.getEthProof(address)).proof // getIndexFromDB

  const isClaimed = await ethMethodsSefi.checkAvailableToClaim(info.index);

  return {
    address,
    amount: new BigNumber(info.amount),
    isClaimed
  }
}

export const claimInfoScrt = async (secretjs, address) => {
  const info = (await services.getScrtProof(address)).content // getIndexFromDB

  const isClaimed = await isClaimedSefiRewardsScrt({ secretjs, index: info.index });

  return {
    address,
    amount: new BigNumber(info.amount),
    isClaimed
  }
}
