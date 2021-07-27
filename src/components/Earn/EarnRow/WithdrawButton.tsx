import { Redeem } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { valueToDecimals } from '../../../utils';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';

const WithdrawButton = ({ props, value, changeValue }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const amount = Number(value).toFixed(6);
  const { theme } = useStores();

  let fee;

  if (props.token.display_props.symbol === 'SEFI') {
    fee = {
      amount: [{ amount: '750000', denom: 'uscrt' }],
      gas: '750000',
    };
  }

  return (
    <Button
      loading={loading}
      className={`${styles.button} ${styles[theme.currentTheme]}`}
      disabled={Number(value) === 0 || isNaN(value)}
      onClick={async () => {
        setLoading(true);
        await Redeem({
          secretjs: props.userStore.secretjsSend,
          address: props.token.rewardsContract,
          amount: valueToDecimals(amount, props.token.decimals),
          fee,
        })
          .then(_ => {
            props.userStore.updateScrtBalance();
            props.notify('success', `Removed ${amount} s${props.token.display_props.symbol} from the rewards contract`);
            changeValue({
              target: {
                value: '0.0',
              },
            });
          })
          .catch(reason => {
            props.notify('error', `Failed to withdraw: ${reason}`);
            console.log(`Failed to withdraw: ${reason}`);
            setLoading(false);
          });
        //TODO FIX THIS
        await Promise.all([
          props.userStore.refreshTokenBalanceByAddress(props.token.rewardsContract),
          props.userStore.refreshRewardsBalances('', props.token.rewardsContract),
        ]).catch(() => setLoading(false));
        setLoading(false);
      }}
    >
      Withdraw
    </Button>
  );
};

export default WithdrawButton;
