// todo: handle properly
import { observer } from 'mobx-react';
import { claimInfoErc, ClaimInfoResponse, claimInfoScrt } from './utils';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import * as thisStyles from '../../../pages/SeFi/styles.styl';
import { Button, Image, Modal } from 'semantic-ui-react';
import { ExitIcon } from '../../../ui/Icons/ExitIcon';
import { IsValid } from '../../../pages/Swap/TokenSelector/IsValid';
import { divDecimals, sleep, truncateAddressString } from '../../../utils';
import { SigningCosmWasmClient } from 'secretjs';
import { Text } from 'components/Base';
import Loader from 'react-loader-spinner';
import { SwapToken } from '../../../pages/Swap/types/SwapToken';
import * as styles from './styles.styl';
import SoftTitleValue from '../SoftTitleValue';
import { FlexRowSpace } from '../../Swap/FlexRowSpace';
import { CopyWithFeedback } from '../../Swap/CopyWithFeedback';

export const CheckClaim = observer((props: {isEth?: boolean, onClick?: any}) => {
  // const { user } = useStores();
  return (
    <button className={cn(thisStyles.balanceButton)} onClick={props.onClick}>
      Check Claim
    </button>
  );
});

export const CheckClaimModal = (props: { secretjs?: SigningCosmWasmClient, address: string, isEth?: boolean, onClick?: any }) => {
  const [open, setOpen] = React.useState<boolean>(false);

  let [claimInfo, setClaimInfo] = useState<ClaimInfoResponse>(undefined);
  let [loading, setLoading] = useState<boolean>(false);
  let [failed, setFailed] = useState<boolean>(false);

  // useEffect(() => {
  //   ;
  //   stuff();
  // }, [props.secretjs, props.address, props.isEth]);
  const loadClaim = async () => {
    console.log('loading claim')
    if (props.isEth) {
      if (props.address) {
        const info = await claimInfoErc(props.address);

        setClaimInfo(info);
      }
    } else {
      while (!props.secretjs) {
        await sleep(100);
      }
      if (props.address) {
        const info = await claimInfoScrt(props.secretjs, props.address).catch(() => {
          setFailed(true);
          return undefined;
        });

        setClaimInfo(info);
      }
    }

  }


  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={async () => {
        setOpen(true);
        setLoading(true);
        try{
          await loadClaim();
        } finally {
          console.log('done loading claim')
          setLoading(false);
        }
      }}
      open={open}
      trigger={<CheckClaim />}
      dimmer={'blurring'}
      style={{ width: '700px', display: 'flex' }}
    >
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>My Claim</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        {loading ? <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" /> : (
        <ClaimBoxInfo amount={claimInfo?.amount.toString()} address={claimInfo?.address} isClaimed={claimInfo?.isClaimed}/>)}
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Claim"
          labelPosition="right"
          icon="checkmark"
          onClick={() => {
            props.onClick(claimInfo?.address);
            setOpen(false);
          }}
          positive
          disabled={claimInfo?.isClaimed}
        />
      </Modal.Actions>
    </Modal>
  );
};


export const ClaimBoxInfo = (props: { address: string; amount?: string; isClaimed?: boolean, onClick?: any }) => {
  return (
    <div>
      <div style={{display: "flex", justifyContent: "center"}}>
        <h3 className={cn(styles.tokenInfoItemsLeft)}>{props.address}</h3>
      </div>
      <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
        <h3 className={cn(styles.tokenInfoItemsLeft)}>{"Amount"}</h3>
        <FlexRowSpace />
        <div className={cn(styles.tokenInfoItemsRight)}>
          <h3>{divDecimals(props.amount, 6)} {"SEFI"}</h3>
        </div>
      </div>
      <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
        <h3 className={cn(styles.tokenInfoItemsLeft)}>{"Available for claim?"}</h3>
        <FlexRowSpace />
        <div className={cn(styles.tokenInfoItemsRight)}>
          <IsValid isValid={!props.isClaimed} />
        </div>
      </div>
    </div>
  );
};