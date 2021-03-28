import { SigningCosmWasmClient } from 'secretjs';
import { Claim, ethMethodsSefi } from '../../../blockchain-bridge';

export const claimScrt = async (secretjs: SigningCosmWasmClient, address: string) => {
  const result = await Claim({ secretjs, address });

  return result;
};

export const claimErc = async () => await ethMethodsSefi.claimToken();
