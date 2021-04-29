import cn from 'classnames';
import * as styles from './styles.styl';
import { Button, Icon, Input, Popup } from 'semantic-ui-react';
import React from 'react';
import { unlockToken } from '../../../utils';
import ScrtTokenBalanceSingleLine from './ScrtTokenBalanceSingleLine';
import BigNumber from 'bignumber.js';
import { unlockJsx } from 'pages/Swap/utils';
import { useStores } from 'stores';

const buttonStyle = {
  borderRadius: '15px',
  fontSize: '1rem',
  fontWeight: 500,
  height: '30px',
  marginRight: '12px',
  marginLeft: '12px',
  padding: '0.5rem 1rem 1rem 1rem',
  color: '#5F5F6B',
  backgroundColor: 'transparent',
};

const AmountButton = (props: { balance: string; multiplier: string; onChange: CallableFunction }) => {
  return (
    <Button.Group className={cn(styles.amountButton)}>
      <Button
        style={buttonStyle}
        disabled={!props.balance || props.balance === unlockToken}
        onClick={() => {
          changeInput(props.balance, props.multiplier, props.onChange);
        }}
      >
        {`${Number(props.multiplier) * 100}%`}
      </Button>
    </Button.Group>
  );
};

const changeInput = (balance, percentage, onChange) => {
  const event = {
    target: {
      value: new BigNumber(balance.replace(/,/g, ''))
        .multipliedBy(percentage)
        .toFixed(6 /* Earn can only work with down to 6 decimal points */, BigNumber.ROUND_DOWN),
    },
  };
  onChange(event);
};
const DepositContainer = props => {

  const createViewingKey = ()=>{
    return unlockJsx({
      onClick:async()=>{
        await props.userStore?.keplrWallet?.suggestToken(props.userStore?.chainId, props.tokenAddress);
      }
    })
  }

  return (
    <div className={`${styles.changeBalance} ${styles[props.theme.currentTheme]}`}>
      <div className={cn(styles.deposit_content)}>
        <div className={cn(styles.balanceRow)}>
          <div className={cn(styles.title)}> 
            {props.title}
          </div>
        </div>
        <div className={cn(styles.balanceRow)}>
          <div className={cn(styles.h4)}>
            <ScrtTokenBalanceSingleLine
              value={props.balance}
              currency={props.currency}
              price={props.price}
              selected={false}
              balanceText={props.balanceText}
              popupText={props.unlockPopupText}
              createKey={createViewingKey}
            />
          </div>
          <div className={cn(styles.subtitle)}>
            {props.balanceText} 
            <Popup
              content={props.unlockPopupText}
              className={styles.iconinfo__popup}
              trigger={ 
                <Icon
                    className={styles.icon_info}
                    name="info"
                    circular
                    size="tiny"
                  />
              }
            />
          </div>
        </div>
        <div>
          <Input placeholder="0.0" className={`${styles.form} ${styles[props.theme.currentTheme]}`} value={props.value} onChange={props.onChange}>
            <input style={{ borderRadius: '4px', height: '40px' }} />
          </Input>
        </div>
        <div className={styles.amountRow}>
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.25'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.5'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'0.75'} />
          <AmountButton balance={props.balance} onChange={props.onChange} multiplier={'1'} />
        </div>
        <div>{props.action}</div>
      </div>
    </div>
  );
};

export default DepositContainer;
