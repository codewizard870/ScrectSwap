import { balanceNumberFormat, nFormatter, toFixedTrunc, unlockToken } from '../../../utils';
import React from 'react';
import Loader from 'react-loader-spinner';
import { Icon, Popup } from 'semantic-ui-react';
import BigNumber from 'bignumber.js';

const ScrtTokenBalanceSingleLine = (props: {
  value: string;
  currency: string;
  selected: boolean;
  balanceText: string;
  popupText: string;
  price?: string;
  createKey: Function;
}) => {
  if (!props.value) {
    return <Loader type="ThreeDots" color="#ff726e" height="1em" width="1em" />;
  } else if (props.value.includes(unlockToken)) {
    return props.createKey() 
    // (
    //   <div>
    //     <Popup
    //       content={props.popupText}
    //       trigger={
    //         <div>
    //           <Icon name="question circle outline" />
    //           {props.currency}
    //         </div>
    //       }
    //     />
    //   </div>
    // );
  } else {
    const valueBN = new BigNumber(props.value.replace(/,/g, '')).toFixed(6, BigNumber.ROUND_DOWN);
    return (
      <>
        {valueBN} {props.currency}{' '}
        {props.price ? `($${nFormatter(new BigNumber(props.price).multipliedBy(valueBN).toFixed(2), 1)})` : null}
      </>
    );
  }
};

export default ScrtTokenBalanceSingleLine;
