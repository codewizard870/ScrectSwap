import { Redeem } from '../../../blockchain-bridge/scrt';
import React, { useState } from 'react';
import { SigningCosmWasmClient } from 'secretjs';
import cn from 'classnames';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';
import { AsyncSender } from '../../../blockchain-bridge/scrt/asyncSender';
import { unlockToken } from 'utils';
import { unlockJsx } from 'pages/Swap/utils';

const ClaimButton = (props: {
  secretjs: AsyncSender;
  contract: string;
  available: string;
  symbol: string;
  notify: Function;
  rewardsToken?: string;
}) => {
  
  const { user } = useStores();
  const [loading, setLoading] = useState<boolean>(false);
  const displayAvailable = ()=>{
    if (props.available === unlockToken) {
      return (<div className={cn(styles.create_viewingkey)}>
        {
          unlockJsx({
          onClick: async () => {
            await user.keplrWallet.suggestToken(user.chainId, props.contract);
            // TODO trigger balance refresh if this was an "advanced set" that didn't
            // result in an on-chain transaction
            await user.updateBalanceForSymbol(props.symbol);
          },
        })
        }
      </div>)
    }else{
      return <strong>{props?.available}</strong>
    }
  }
  return (
    <>
    <span 
      className={cn(styles.claim_label)}
    >
      {displayAvailable()}{props.rewardsToken}
    </span>
    <Button
      loading={loading}
      className={cn(styles.button)}
      disabled={typeof props.available === 'undefined' || props.available === '0'}
      onClick={async () => {
        setLoading(true);
        try {
          await Redeem({
            secretjs: props.secretjs,
            address: props.contract,
            amount: '0',
          });

          props.notify('success', `Claimed ${props.available} s${props.symbol}`);
        } catch (reason) {
          props.notify('error', `Failed to claim: ${reason}`);
          console.error(`Failed to claim: ${reason}`);
        }
        await Promise.all([
          await user.updateBalanceForSymbol(props.symbol),
          await user.updateBalanceForSymbol(props.rewardsToken || 'sSCRT'),
          await user.refreshRewardsBalances(props.rewardsToken),
        ]);
        setLoading(false);
      }}
    >
      Claim
    </Button>
    </>
  );
};

export default ClaimButton;
