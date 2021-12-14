import cn from 'classnames';
import styles from './styles.styl';
import ClaimButton from './ClaimButton';
import React, { useEffect, useState } from 'react';
import ScrtTokenBalance from '../ScrtTokenBalance';
import { UserStoreEx } from '../../../stores/UserStore';

const ClaimBox = (props: {
  balance: string;
  unlockPopupText: string;
  rewardsContract: string;
  userStore: UserStoreEx;
  available: string;
  symbol: string;
  notify?: Function;
  rewardsToken?: string;
  deprecated?: boolean;
}) => {
  return (
    <div className={cn(styles.claimBox)}>
      <ClaimButton
        balance={props.balance}
        unlockPopupText={props.unlockPopupText}
        secretjs={props.userStore.secretjsSend}
        contract={props.rewardsContract}
        available={props.available}
        symbol={props.symbol}
        notify={props.notify}
        rewardsToken={props.rewardsToken}
        rewardsContract={props.rewardsContract}
      />
    </div>
  );
};

export default ClaimBox;
