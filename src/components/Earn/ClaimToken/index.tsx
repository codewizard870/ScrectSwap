import React from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';
import { observer } from 'mobx-react';
import { useStores } from '../../../stores';
import { claimErc, claimScrt } from './utils';

// todo: handle properly
export const ClaimTokenScrt = observer((props: { text: string; onClick: any; disabled: boolean }) => {
  const { user } = useStores();
  return (
    <ClaimToken
      text={'Claim SeFi'}
      onClick={() => {
        try {
          claimScrt(user.secretjs, user.address).then(() => {});
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
      text={'Claim SeFi'}
      onClick={() => {
        try {
          claimErc().then(() => {});
          console.log('success in claim');
        } catch (e) {
          console.error('failed to claim');
        }
      }}
    />
  );
};

const ClaimToken = (props: { text: string; onClick: any }) => {
  return <button className={cn(styles.button)} onClick={props.onClick} />;
};
