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

const MigrateAssets = observer(props => {
  const newRewardsContract = process.env.SEFI_STAKING_CONTRACT;
  const oldRewardsContract = process.env.SEFI_STAKING_OLD_CONTRACT;

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
    // if (balance.toLowerCase() === 'unlock' || !balance) {
    //   notify('error', 'You need a viewing key to perform this transaction', 10);
    //   return;
    // }
    // if(balance === '0'){
    //   notify('error', "You don't balance in old pool", 10);
    //   return;
    // }
    try {
      setLoading(true);
      const msg = 'eyJkZXBvc2l0Ijp7fX0K'; // '{"deposit":{}}' -> base64
      const amount = balance;
      // const res = await user.secretjsSend.execute(process.env.SCRT_GOV_TOKEN_ADDRESS,{
      //   send: {
      //     amount:'44000000',
      //     recipient: oldRewardsContract,
      //     msg,
      //   },
      // })
      // console.log(res)

      const res: ExecuteResult = await user.secretjsSend.multiExecute(
        [
          {
            contractAddress: oldRewardsContract,
            handleMsg: {
              redeem: {
                amount,
              },
            },
          },
          {
            contractAddress: process.env.SCRT_GOV_TOKEN_ADDRESS,
            handleMsg: {
              send: {
                amount,
                recipient: newRewardsContract,
                msg,
              },
            },
          },
        ],
        'Migrating assets from old SEFI pool to new',
        fee,
      );
      notify('success',`You migrated ${divDecimals(balance,6)} SEFI to our new pool`)
      storeTxResultLocally(res);

    } catch (error) {
      notify('error', error.message, 1000);
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
      trigger={props.children}
    >
      <h1>Migrate your tokens</h1>
      <div className="balance-wrapper">
        {balance.toLowerCase() === 'unlock' || isNaN(parseInt(balance)) ? (
          <h4>Old pool balance : {unlockJsx({ onClick: createVK })}</h4>
        ) : (
          <h4>Old pool balance : {divDecimals(balance, 6)} SEFI Staking</h4>
        )}
      </div>
      <button  className="migrate-button" onClick={migrate}>
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
