import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Icon, Loader, Modal, Popup } from 'semantic-ui-react';
import { useStores } from 'stores';
import { ExecuteResult } from 'secretjs';
import { storeTxResultLocally } from 'pages/Swap/utils';
import { notify } from '../../../blockchain-bridge/scrt/utils';
import { divDecimals } from 'utils';
import './style.scss';
import { ReactChild } from 'react';

interface MigrateAssetsProps {
  newRewardsContract: string;
  oldRewardsContract: string;
  lockedAsset: string;
  balance: string;
  lockedAssetAddress: string;
  children: ReactChild;
}

const MigrateAssets = observer(
  ({
    newRewardsContract,
    oldRewardsContract,
    lockedAsset,
    lockedAssetAddress,
    children,
    balance,
  }: MigrateAssetsProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { user, theme } = useStores();

    useEffect(() => {
      (async () => {
        if (open) {
          await user.refreshTokenBalanceByAddress(lockedAssetAddress);
          await user.refreshRewardsBalances('', oldRewardsContract);
        }
      })();
    }, [lockedAssetAddress, oldRewardsContract, open, user]);

    const migrate = async () => {
      if (balance?.toLowerCase() === 'unlock' || !balance) {
        notify('error', 'You need a viewing key to perform this transaction', 10);
        return;
      }
      if (balance === '0') {
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
                emergency_redeem: {},
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
        notify('success', `You migrated ${divDecimals(balance, 6)} ${lockedAsset} to the new pool`, 10);
        storeTxResultLocally(res);
      } catch (error) {
        notify('error', error.message, 10);
      } finally {
        setLoading(false);
      }
    };

    return (
      <Modal
        className={`migrate-${theme.currentTheme}`}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        trigger={children}
      >
        {balance?.toLowerCase() === 'unlock' || isNaN(parseInt(balance)) || !balance || balance === undefined ? (
          <p>
            <Icon name="info circle" /> Unfortunately we can't automatically migrate your tokens. Please do it manually:
            Press the Withdraw button (without an amount) to pull out your tokens and stake in the new pool!
          </p>
        ) : (
          <>
            <h1>Migrate your tokens</h1>
            <div className="balance-wrapper">
              <h4>
                Old pool balance : {divDecimals(balance, 6)} {lockedAsset}&nbsp;
                <Popup trigger={<Icon name="info circle" />}>
                  Don't worry, any staked tokens will be pulled out and staked into the new contract
                </Popup>
              </h4>
            </div>
            <button disabled={isNaN(parseInt(balance)) || balance === '0'} className="migrate-button" onClick={migrate}>
              {loading ? (
                <Loader size="tiny" inline active>
                  Loading...
                </Loader>
              ) : (
                'Migrate your tokens'
              )}
            </button>
          </>
        )}
      </Modal>
    );
  },
);

export default MigrateAssets;

const fee = {
  amount: [{ amount: '1500000', denom: 'uscrt' }],
  gas: '1500000',
};
