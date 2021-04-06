import React from 'react';
import { Image } from 'semantic-ui-react';
import cn from 'classnames';
import * as styles from '../styles.styl';
import Loader from 'react-loader-spinner';
import { FlexRowSpace } from '../../../components/Swap/FlexRowSpace';
import { SwapToken } from '../types/SwapToken';
import BigNumber from 'bignumber.js';
import { displayHumanizedBalance, humanizeBalance } from 'utils/formatNumber';

export const TokenInfoRow = (props: { token: SwapToken; balance?: any; onClick?: any }) => {
  const getBalance = () => {
    //Loading 
    if(props.balance === undefined){
      return <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" style={{ margin: 'auto' }} />
    }
    //Returns View element
    if(JSON.stringify(props.balance).includes('View')){
      return props.balance;
    }
    //Return real value
    return displayHumanizedBalance(
      humanizeBalance(new BigNumber(props.balance as BigNumber), props.token.decimals),
      BigNumber.ROUND_DOWN,
    );
  }
  return (
    <div style={{ display: 'flex' }}>
      <div className={cn(styles.tokenInfoRow)} onClick={props.onClick}>
        <div className={cn(styles.tokenInfoItemsLeft)}>
          <Image src={props.token.logo} avatar style={{ boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px' }} />
          <p className={cn(styles.tokenTitle)}>{props.token.symbol}</p>
        </div>
        <FlexRowSpace />
        <div className={cn(styles.tokenInfoItemsRight)}>
          {getBalance()}
        </div>
      </div>
      {/* <h3 style={{ margin: 'auto',color:'#5F5F6B' }} hidden={!props.token.address}>
        <CopyWithFeedback text={props.token.address} />
      </h3> */}
    </div>
  );
};
