import React from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores';
import { claimErc, claimScrt } from './utils';

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

const ClaimToken = (props: { text: string; onClick: any }) => {
  return <button className={cn(styles.button)} onClick={props.onClick}>
    {props.text}
  </button>;
};
