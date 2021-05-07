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
  const {theme}= useStores();
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
          });
        await Promise.all([
          props.userStore.refreshRewardsBalances(props.token.display_props.symbol),
          props.userStore.refreshTokenBalance(props.token.display_props.symbol),
        ]);
        setLoading(false);
      }}
    >
      Withdraw
    </Button>
  );
};

export default WithdrawButton;
