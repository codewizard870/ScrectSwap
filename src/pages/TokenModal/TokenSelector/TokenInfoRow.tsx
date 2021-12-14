import React, { useState, useEffect } from 'react';
import { Image } from 'semantic-ui-react';
import cn from 'classnames';
import styles from '../styles.styl';
import Loader from 'react-loader-spinner';
import { FlexRowSpace } from '../../../components/Swap/FlexRowSpace';
import { SwapToken } from '../types/SwapToken';
import BigNumber from 'bignumber.js';
import { displayHumanizedBalance, humanizeBalance } from 'utils/formatNumber';
import { useStores } from 'stores';
import { fixUnlockToken, unlockToken } from 'utils';
import { getNativeBalance, unlockJsx, wrongViewingKey } from './utils';
import { CosmWasmClient } from 'secretjs';
import { CopyWithFeedback } from '../../../components/Swap/CopyWithFeedback';

export const TokenInfoRow = (props: { token: SwapToken; balance?: any; onClick?: any }) => {
  let { user } = useStores();
  // let [balance, setBalance] = useState<any>(<Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" style={{ margin: 'auto' }} />);

  // const getBalance = () => {
  //   refreshTokenBalance(props.token).then((balance)=>{
  //     //Loading
  //     if(balance === undefined){
  //       setBalance(<Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" style={{ margin: 'auto' }} />);
  //       console.log("Undefined")
  //     }
  //     //Returns View element
  //     if(JSON.stringify(balance).includes('View')){
  //       setBalance(balance);
  //     } else{
  //       //Return real value
  //       setBalance(displayHumanizedBalance(
  //         humanizeBalance(new BigNumber(balance as BigNumber), props.token.decimals),
  //         BigNumber.ROUND_DOWN,
  //       ));
  //     }
  //   });
  // }

  // async function refreshTokenBalance(token: SwapToken) {
  //   let userBalancePromise; //balance.includes(unlockToken)
  //   if (token.identifier.toLowerCase() !== 'uscrt') {
  //     // todo: move this inside getTokenBalance?
  //     const tokenAddress = token?.address;

  //     if (!tokenAddress) {
  //       console.log('refreshTokenBalance: Cannot find token address for symbol', token.symbol);
  //       return {};
  //     }

  //     let balance = await user.getSnip20Balance(tokenAddress);

  //     if (balance === unlockToken) {
  //       balance = unlockJsx({
  //         onClick: async () => {
  //           await user.keplrWallet.suggestToken(user.chainId, tokenAddress);
  //           // TODO trigger balance refresh if this was an "advanced set" that didn't
  //           // result in an on-chain transaction
  //         },
  //       });
  //       userBalancePromise = balance;
  //     } else if (balance === fixUnlockToken) {
  //       userBalancePromise = wrongViewingKey;
  //     } else {
  //       userBalancePromise = new BigNumber(balance);
  //     }
  //   } else {
  //     userBalancePromise = await getNativeBalance(user.address, user.secretjsSend);
  //   }

  //   return userBalancePromise ;
  // }
  // getBalance();
  const { theme } = useStores();
  return (
    <div
      className={`${styles.tokenWrapper} ${styles[theme.currentTheme]}`}
      style={{ paddingRight: '1.5rem', display: 'flex' }}
    >
      <div className={`${styles.tokenInfoRow} ${styles[theme.currentTheme]}`} onClick={props.onClick}>
        <div className={cn(styles.tokenInfoItemsLeft)}>
          <Image src={props.token.logo} avatar style={{ boxShadow: 'rgba(0, 0, 0, 0.075) 0px 6px 10px' }} />
          <p className={`${styles.tokenTitle} ${styles[theme.currentTheme]}`}>{props.token.symbol}</p>
        </div>
        <FlexRowSpace />
        <div className={`${styles.tokenInfoItemsRight} ${styles[theme.currentTheme]}`}>
          {props.token.identifier !== 'uscrt' ? props.token.address : 'native'}
        </div>
      </div>
      <h3 className={`${styles.CopyWithFeedback} ${styles[theme.currentTheme]}`} hidden={!props.token.address}>
        <CopyWithFeedback text={props.token.address} />
      </h3>
    </div>
  );
};
