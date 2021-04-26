import React, { Component } from 'react';

import * as styles from './styles.styl';
import cn from 'classnames';
import { Accordion, Divider, Grid, Icon, Image, Segment } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import EarnButton from './EarnButton';
import DepositContainer from './DepositContainer';
import ClaimBox from './ClaimBox';
import { UserStoreEx } from '../../../stores/UserStore';
import { observer } from 'mobx-react';
import WithdrawButton from './WithdrawButton';
import { divDecimals, formatWithTwoDecimals, zeroDecimalsFormatter } from '../../../utils';
import { Text } from '../../Base';
import ScrtTokenBalance from '../ScrtTokenBalance';
import { useStores } from 'stores';
import Theme from 'themes';

interface RewardsToken {
  name: string;
  decimals: string;
  display_props: {
    image: string;
    label: string;
    symbol: string;
  };
  price: string;
  rewardsPrice: string;
  balance: string;
  deposit: string;
  rewards: string;
  rewardsContract: string;
  rewardsDecimals: string;
  lockedAsset: string;
  lockedAssetAddress: string;
  totalLockedRewards: string;
  remainingLockedRewards: string;
  deadline: number;
  rewardsSymbol?: string;
}

const calculateAPY = (token: RewardsToken, price: number, priceUnderlying: number) => {
  // console.log(Math.round(Date.now() / 1000000))
  // deadline - current time, 6 seconds per block
  const timeRemaining = (token.deadline - 3004867) * 6.22 + 1618321783 - Math.round(Date.now() / 1000);

  // (token.deadline - Math.round(Date.now() / 1000000) );
  const pending = Number(divDecimals(token.remainingLockedRewards, token.rewardsDecimals)) * price;

  // this is already normalized
  const locked = Number(token.totalLockedRewards);

  //console.log(`pending - ${pending}; locked: ${locked}, time remaining: ${timeRemaining}`)
  return (((pending * 100) / locked) * (3.154e7 / timeRemaining)).toFixed(0);
};

const apyString = (token: RewardsToken) => {
  const apy = Number(calculateAPY(token, Number(token.rewardsPrice), Number(token.price)));
  if (isNaN(apy) || 0 > apy) {
    return `0%`;
  }

  const apyStr = zeroDecimalsFormatter.format(Number(apy));

  return `${apyStr}%`;
};

@observer
class EarnRow extends Component<
  {
    userStore: UserStoreEx;
    token: RewardsToken;
    notify: Function;
    callToAction: string;
    theme: Theme;
  },
  {
    activeIndex: Number;
    depositValue: string;
    withdrawValue: string;
    claimButtonPulse: boolean;
    pulseInterval: number;
    secondary_token:any;
  }
> {
  state = {
    activeIndex: -1,
    depositValue: '0.0',
    withdrawValue: '0.0',
    claimButtonPulse: true,
    pulseInterval: -1,
    secondary_token:{
      image:'',
      symbol:'',
    },
  };

  handleChangeDeposit = event => {
    this.setState({ depositValue: event.target.value });
  };

  handleChangeWithdraw = event => {
    this.setState({ withdrawValue: event.target.value });
  };

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    if (activeIndex === -1) {
      this.props.userStore.updateBalanceForSymbol(this.props.token.display_props.symbol);
      this.props.userStore.refreshRewardsBalances(this.props.token.display_props.symbol);
    }
    this.setState({ activeIndex: newIndex });
  };

  togglePulse = () =>
    this.setState(prevState => ({
      claimButtonPulse: !prevState.claimButtonPulse,
    }));

  clearPulseInterval = () => clearInterval(this.state.pulseInterval);

  setPulseInterval = interval => this.setState({ pulseInterval: interval });
  render() {
    // const style = Number(this.props.token.balance) > 0 ? styles.accordionHaveDeposit : `${styles.accordion} ${styles[this.props.theme.currentTheme]}`;
    const style =`${styles.accordion} ${styles[this.props.theme.currentTheme]}`;
    //this.props.userStore.keplrWallet.suggestToken(this.props.userStore.chainId, );
    const { activeIndex } = this.state;
    const images = [
      {
        symbol:'sscrt',
        src:'/static/tokens/sscrt.svg'
      },
      {
        symbol:'scrt',
        src:'/static/tokens/srct.svg'
      },
      {
        symbol:'sefi',
        src:'/static/tokens/sefi.png'
      },
      {
        symbol:'seth',
        src:'/static/tokens/seth.png'
      },
      {
        symbol:'slink',
        src:'/static/tokens/slink.png'
      },
      {
        symbol:'susdt',
        src:'/static/tokens/susdt.png'
      },
      {
        symbol:'swbtc',
        src:'/static/tokens/swbtc.png'
      },
    ]
    const _symbols = this.props.token.lockedAsset?.split('-');
    const image_primaryToken = images.filter((img)=>img.symbol === _symbols[1]?.toLowerCase());
    const image_secondaryToken = images.filter((img)=>img.symbol === _symbols[2]?.toLowerCase());

    return (
      <Accordion
        className={cn(style)}
      >
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.handleClick}
          className={cn(styles.assetRow)}
        >
          {(this.props.token.lockedAsset === "SEFI")?
              <div className={cn(styles.assetIcon)}>
                <Image src="/static/tokens/sefi.png" rounded size="mini" />
              </div>
            :
            (
              <div className={cn(styles.assetIcon)}>
              <Image src={image_primaryToken[0]?.src} rounded size="mini" />
              <Image src={image_secondaryToken[0]?.src} rounded size="mini" />
              </div>
            )
          }
          <div className={cn(styles.title_content__center)}>
            <div className={cn(styles.title_item__container)}>
              <SoftTitleValue
                title={
                  this.props.token.display_props.label === 'SEFI' ? 'SEFI STAKING' : this.props.token.display_props.label
                }
                subTitle='    '
              />
            </div>
            <div className={cn(styles.title_item__container)}>
              <SoftTitleValue title={apyString(this.props.token)} subTitle={'APY'} />
            </div>
            <div className={cn(styles.title_item__container)}>
              <SoftTitleValue
                title={`$${formatWithTwoDecimals(Number(this.props.token.totalLockedRewards))}`}
                subTitle={'TVL'}
              />
            </div>
            {/* <div className={cn(styles.title_item__container)}>
              <SoftTitleValue
                title={`$${formatWithTwoDecimals(Number(this.props.token.balance))}`}
                subTitle={this.props.token.display_props.label}
              />
            </div>
            <div className={cn(styles.title_item__container)}>
              <SoftTitleValue title={formatWithTwoDecimals(this.props.token.rewards)} subTitle={this.props.callToAction} />
            </div> */}
            
          </div>
          <Icon style={{
            color:(this.props.theme.currentTheme == 'dark')?'white':''
          }} name="dropdown" />
        </Accordion.Title>
        <Accordion.Content className={`${styles.content} ${styles[this.props.theme.currentTheme]}`} active={activeIndex === 0}>
          {/* <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',

              marginLeft: '3.5rem',
              marginRight: '3.5rem',
            }}
          >
            <ScrtTokenBalance
              value={this.props.token.balance}
              decimals={0}
              currency={this.props.token.lockedAsset}
              userStore={this.props.userStore}
              tokenAddress={this.props.token.lockedAssetAddress}
              selected={this.state.activeIndex === 0}
              minimumFactions={0}
              subtitle={`Available to Deposit`}
              pulse={this.state.claimButtonPulse}
              pulseInterval={this.state.pulseInterval}
              unlockTitle={'View Balance'}
              unlockSubtitle={'Available to Deposit'}
              onUnlock={value => {
                if (value) {
                  this.props.notify(
                    'success',
                    `Created a viewing key for ${this.props.token.display_props.symbol !== 'SEFI' ? 's' : ''}${
                      this.props.token.display_props.symbol
                    }`,
                  );
                } else {
                  this.props.notify(
                    'error',
                    `Failed to create viewing key for s${this.props.token.display_props.symbol}!`,
                  );
                }
              }}
            />
            <ScrtTokenBalance
              subtitle={'Available Rewards'}
              tokenAddress={this.props.token.rewardsContract}
              decimals={0}
              userStore={this.props.userStore}
              currency={this.props.token.rewardsSymbol || 'sSCRT'}
              selected={false}
              value={this.props.token.rewards}
              pulse={this.state.claimButtonPulse}
              pulseInterval={this.state.pulseInterval}
              unlockTitle="View Balance"
              unlockSubtitle="Available Rewards"
              onUnlock={value => {
                if (value) {
                  this.props.notify(
                    'success',
                    `Created a viewing key for ${this.props.token.display_props.symbol !== 'SEFI' ? 's' : ''}${
                      this.props.token.display_props.symbol
                    } rewards`,
                  );
                } else {
                  this.props.notify(
                    'error',
                    `Failed to create viewing key for s${this.props.token.display_props.symbol} rewards!`,
                  );
                }
              }}
            />
          </div> */}
          <div>
            <Segment basic>
              <Grid className={cn(styles.content2)} columns={2} relaxed="very" stackable>
                <Grid.Column>
                  <DepositContainer
                    title='Earn'
                    value={this.state.depositValue}
                    action={
                      <Grid columns={1} stackable relaxed={'very'}>
                        <Grid.Column
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                          }}
                        >
                          <EarnButton
                            props={this.props}
                            value={this.state.depositValue}
                            changeValue={this.handleChangeDeposit}
                            togglePulse={this.togglePulse}
                            setPulseInterval={this.setPulseInterval}
                          />
                        </Grid.Column>
                      </Grid>
                    }
                    onChange={this.handleChangeDeposit}
                    balance={this.props.token.balance}
                    currency={this.props.token.lockedAsset}
                    price={this.props.token.price}
                    balanceText="Available"
                    unlockPopupText='In order to view your available assets, click on "View Balance" above'
                    tokenAddress={this.props.token.lockedAssetAddress} 
                    userStore={this.props.userStore}
                    theme={this.props.theme}
                  />
                </Grid.Column>
                <Grid.Column>
                  <DepositContainer
                    title='Withdraw'
                    value={this.state.withdrawValue}
                    onChange={this.handleChangeWithdraw}
                    action={
                      <Grid columns={1} stackable relaxed={'very'}>
                        <Grid.Column
                          style={{
                            display: 'flex',
                            justifyContent:'flex-start',
                          }}
                        >
                          <WithdrawButton
                            props={this.props}
                            value={this.state.withdrawValue}
                            changeValue={this.handleChangeWithdraw}
                          />
                        </Grid.Column>
                      </Grid>
                    } //({props: this.props, value: this.state.withdrawValue})}
                    balance={this.props.token.deposit}
                    currency={this.props.token.rewardsSymbol}
                    price={this.props.token.price}
                    balanceText="Locked"
                    unlockPopupText='In order to view your locked assets, click on "View Balance" below'
                    tokenAddress={this.props.token.rewardsContract} 
                    userStore={this.props.userStore}
                    theme={this.props.theme}
                  />
                </Grid.Column>
              </Grid>
            </Segment>
          </div>
          <ClaimBox
            available={this.props.token.rewards}
            userStore={this.props.userStore}
            rewardsContract={this.props.token.rewardsContract}
            symbol={this.props.token.display_props.symbol}
            notify={this.props.notify}
            rewardsToken={this.props.token.rewardsSymbol || 'sSCRT'}
          />
          {/* <Text
            size="medium"
            style={{
              padding: '20 20 0 20',
              cursor: 'auto',
              textAlign: 'center',
            }}
          >
            * Every time you deposit, withdraw or claim the contract will automagically claim your rewards for you!
          </Text> */}
        </Accordion.Content>
      </Accordion>
    );
  }
}

export default EarnRow;
