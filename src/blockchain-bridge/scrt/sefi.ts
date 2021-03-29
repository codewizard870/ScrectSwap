import { SigningCosmWasmClient } from 'secretjs';

export const isClaimedSefiRewardsScrt = async (params: {
  secretjs: SigningCosmWasmClient;
  index: number;
}): Promise<boolean> => {
  const { secretjs, index } = params;

  try {
    return await secretjs.queryContractSmart(process.env.ETH_GOV_TOKEN_ADDRESS, { is_claimed: { index: String(index) } });
  } catch (e) {
    console.error(e)
    throw Error('Address does not exist');
  }
}

