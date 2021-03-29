import React, { useEffect, useRef, useState } from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores';
import { claimErc, claimInfoErc, ClaimInfoResponse, claimInfoScrt, claimScrt } from './utils';
import BigNumber from 'bignumber.js';
import { divDecimals, formatWithSixDecimals } from '../../../utils';
import Loader from 'react-loader-spinner';

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
          console.error(`failed to claim ${e}`);
        }
      }}
    />
  );
};

function ClaimInfoDisplay(props: { failed?: boolean, address: string, claimed: boolean, claimAmount: BigNumber }) {
  return props.address ? <>{props?.failed ? <>failed</> : <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}</> : <div>
    {"Claim Info"}
    <div>
      {"Address: "} {props.address}
    </div>
    <div>
      {"IsClaimed: "} {props.claimed ? 'True': 'False'}
    </div>
    <div>
      {"Amount: "} {divDecimals(props.claimAmount.toString(), 6)}
    </div>
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
        const claimInfo = await claimInfoScrt(user.secretjs, user.address);

        setClaimAddress(user.address);
        setIsClaimed(claimInfo.isClaimed);
        setClaimAmount(claimInfo.amount);
      }
    }

    stuff();
  }, [])

  return <ClaimInfoDisplay address={address} claimed={isClaimed} claimAmount={claimAmount} />;
});

export const ClaimInfoErc = () => {
  const { userMetamask } = useStores();

  let [claimAmount, setClaimAmount] = useState<BigNumber>(new BigNumber(0))
  let [isClaimed, setIsClaimed] = useState<boolean>(false)
  let [address, setClaimAddress] = useState<string>(undefined)
  let [failed, setFailed] = useState<boolean>(false)
  let [claimInfo, setClaimInfo] = useState<object>({})
  const refContainer = useRef<ClaimInfoResponse>(undefined);

  useEffect(() => {
    const stuff = async () => {
      console.log(`hello ${userMetamask.ethAddress}`)
      if (userMetamask.ethAddress) {
        refContainer.current = await claimInfoErc(userMetamask.ethAddress);
      }
    }
    stuff();

  }, [userMetamask.ethAddress])

  return (
    <ClaimInfoDisplay failed={failed} address={refContainer?.current?.address} claimed={refContainer?.current?.isClaimed} claimAmount={refContainer?.current?.amount} />
  )
};

const ClaimToken = (props: { text: string; onClick: any }) => {
  return (
    <button className={cn(styles.button)} onClick={props.onClick}>
      {props.text}
    </button>
  );
};
