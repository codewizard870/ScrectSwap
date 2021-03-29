import React, { useEffect, useState } from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores';
import { claimErc, claimInfoErc, claimInfoScrt, claimScrt } from './utils';
import BigNumber from 'bignumber.js';

// todo: handle properly
export const ClaimTokenScrt = observer(() => {
  const { user } = useStores();
  return (
    <ClaimToken
      text={'Claim SeFi SCRT'}
      onClick={async () => {
        try {
          await claimScrt(user.secretjs, user.address);
          console.log('success in claim');
        } catch (e) {
          console.error('failed to claim');
        }
      }}
    />
  );
});

// todo: handle properly
export const ClaimTokenErc = () => {
  return (
    <ClaimToken
      text={'Claim SeFi ERC20'}
      onClick={async () => {
        try {
          await claimErc();
          console.log('success in claim');
        } catch (e) {
          console.error('failed to claim');
        }
      }}
    />
  );
};

function ClaimInfoDisplay(props: { address: string, claimed: boolean, claimAmount: BigNumber }) {
  return <div>
    <>
      Address: {props.address}
    </>
    <>
      IsClaimed: {props.claimed}
    </>
    <>
      Amount: {props.claimAmount}
    </>
  </div>;
}

export const ClaimInfoScrt = observer(() => {
  const { user } = useStores();

  const [claimAmount, setClaimAmount] = useState<BigNumber>(new BigNumber(0))
  const [isClaimed, setIsClaimed] = useState<boolean>(false)
  const [address, setClaimAddress] = useState<string>(undefined)

  useEffect(() => {
    const stuff = async () => {
      if (user.address) {
        setClaimAddress(user.address);
        const claimInfo = await claimInfoScrt(user.secretjs, user.address);

        setIsClaimed(claimInfo.isClaimed);
        setClaimAmount(claimInfo.amount);
      }
    }

    stuff();
  })

  return (
    <ClaimInfoDisplay address={address} claimed={isClaimed} claimAmount={claimAmount} />
  )
});

export const ClaimInfoErc = observer(() => {
  const { userMetamask } = useStores();

  const [claimAmount, setClaimAmount] = useState<BigNumber>(new BigNumber(0))
  const [isClaimed, setIsClaimed] = useState<boolean>(false)
  const [address, setClaimAddress] = useState<string>(undefined)

  useEffect(() => {
    const stuff = async () => {
      if (userMetamask.ethAddress) {
        setClaimAddress(userMetamask.ethAddress);
        const claimInfo = await claimInfoErc(userMetamask.ethAddress);

        setIsClaimed(claimInfo.isClaimed);
        setClaimAmount(claimInfo.amount);
      }
    }

    stuff();
  })

  return (
    <ClaimInfoDisplay address={address} claimed={isClaimed} claimAmount={claimAmount} />
  )
});

const ClaimToken = (props: { text: string; onClick: any }) => {
  return <button className={cn(styles.button)} onClick={props.onClick}>
    {props.text}
  </button>;
};
