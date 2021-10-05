import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Dimmer, Loader, Modal } from 'semantic-ui-react';
import { useStores } from 'stores';
import { ExecuteResult } from 'secretjs';
import { storeTxResultLocally } from 'pages/Swap/utils';
import { notify } from '../../../blockchain-bridge/scrt/utils';
import { unlockJsx } from 'pages/Pool/utils';
import { divDecimals } from 'utils';
import './style.scss';
import { parse } from 'query-string';
import { ReactChild } from 'hoist-non-react-statics/node_modules/@types/react';

interface MigrateAssetsProps {
  newRewardsContract:string;
  oldRewardsContract:string;
  lockedAsset:string;
  lockedAssetAddress:string;
  children:ReactChild
}

const MigrateAssets = observer(({newRewardsContract,oldRewardsContract,lockedAsset,lockedAssetAddress,children}:MigrateAssetsProps) => {

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<string>('');
  const { user, theme } = useStores();

  const createVK = async () => {
    await user.keplrWallet.suggestToken(process.env.CHAIN_ID, oldRewardsContract);
    await getBalance();
  };

  const getBalance = async () => {
    await user.refreshTokenBalanceByAddress(process.env.SCRT_GOV_TOKEN_ADDRESS);
    await user.refreshRewardsBalances('',oldRewardsContract);
    const amount = await user.getSnip20Balance(oldRewardsContract);
    setBalance(amount);
    return amount;
  };

  const migrate = async () => {
    if (balance.toLowerCase() === 'unlock' || !balance) {
      notify('error', 'You need a viewing key to perform this transaction', 10);
      return;
    }
    if(balance === '0'){
      notify('error', "You don't balance in old pool", 10);
      return;
    }
        
    try {
      setLoading(true);
      const msg = 'eyJkZXBvc2l0Ijp7fX0K'; // '{"deposit":{}}' -> base64
      const amount = balance;

      const res: ExecuteResult = await user.secretjsSend.multiExecute(
        [
          {
            contractAddress: oldRewardsContract,
            handleMsg: {
              emergency_redeem: {
              },
            },
          },
          {
            contractAddress: lockedAssetAddress,
            handleMsg: {
              send: {
                amount,
                recipient: newRewardsContract,
                msg,
              },
            },
          },
        ],
        `Migrating assets from old ${lockedAsset} pool to new`,
        fee,
      );
      notify('success',`You migrated ${divDecimals(balance,6)} ${lockedAsset} to the new pool`,10)
      setBalance('0')
      storeTxResultLocally(res);

    } catch (error) {
      notify('error', error.message, 10);
    } finally {
      await getBalance();
      setLoading(false);
    }
  };

  useEffect(() => {
    getBalance();
  }, [open]);

  return (
    <Modal
      className={`migrate-${theme.currentTheme}`}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={children}
    >
      <h1>Migrate your tokens</h1>
      <div className="balance-wrapper">
        {
          balance.toLowerCase() === 'unlock'  
            ? <h4>Old pool balance : {unlockJsx({ onClick: createVK })}</h4>
            : isNaN(parseInt(balance)) || !balance || balance === undefined
              ? <Loader size='tiny' inline active >Loading...</Loader> 
              : <h4>Old pool balance : {divDecimals(balance, 6)} SEFI Staking </h4>
        }
      </div>
      <button disabled={isNaN(parseInt(balance)) || balance=== '0'}  className="migrate-button" onClick={migrate}>
        {loading ? <Loader size='tiny' inline active >Loading...</Loader> : 'Migrate your tokens'}
      </button>
    </Modal>
  );
});

export default MigrateAssets;

const fee = {
  amount: [{ amount: '1500000', denom: 'uscrt' }],
  gas: '1500000',
};
