import { SigningCosmWasmClient } from 'secretjs';
import { Claim, ethMethodsSefi, isClaimedSefiRewardsScrt } from '../../../blockchain-bridge';
import BigNumber from 'bignumber.js';

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
  const index = 0 // getIndexFromDB

  const isClaimed = await ethMethodsSefi.checkAvailableToClaim(index);

  return {
    address,
    amount: new BigNumber("0x1111"),
    isClaimed
  }
}

export const claimInfoScrt = async (secretjs, address) => {
  const index = 0 // getIndexFromDB

  const isClaimed = await isClaimedSefiRewardsScrt({ secretjs, index });

  return {
    address,
    amount: new BigNumber("0x1111"),
    isClaimed
  }
}
