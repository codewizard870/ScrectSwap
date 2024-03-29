import React, { Component } from 'react';
import styles from './styles.styl';
import cn from 'classnames';
import { Accordion, Grid, Icon, Image, Segment } from 'semantic-ui-react';
import SoftTitleValue from '../SoftTitleValue';
import EarnButton from './EarnButton';
import DepositContainer from './DepositContainer';
import ClaimBox from './ClaimBox';
import { UserStoreEx } from '../../../stores/UserStore';
import { observer } from 'mobx-react';
import WithdrawButton from './WithdrawButton';
import { divDecimals, formatWithTwoDecimals, zeroDecimalsFormatter, formatZeroDecimals } from '../../../utils';
import { Text } from '../../Base';
import stores from 'stores';
import Theme from 'themes';
import MigrateAssets from '../MigrateTokens';
import {ModalExplanation, ModalMultiplierTip} from '../APRModalExp';
import { InfoIcon } from 'components/Base/components/Icons/tsx_svg_icons';
import numeral from 'numeral';

const newRewardsContract = globalThis.config.SEFI_STAKING_CONTRACT;
const oldRewardsContract = globalThis.config.SEFI_STAKING_OLD_CONTRACT;

export const calculateAPY = (token: RewardsToken, price: number, priceUnderlying: number) => {
  // console.log(Math.round(Date.now() / 1000000))
  // deadline - current time, 6 seconds per block
  const timeRemaining = (Math.min(token.deadline, 7916452) - 427936) * 6.2 + 1634215386 - Math.round(Date.now() / 1000);

  // (token.deadline - Math.round(Date.now() / 1000000) );
  const pending = Number(divDecimals(token.remainingLockedRewards, token.rewardsDecimals)) * price;

  // this is already normalized
  const locked = Number(token.totalLockedRewards);

  //console.log(`pending - ${pending}; locked: ${locked}, time remaining: ${timeRemaining}`)
  const apr = Number((((pending * 100) / locked) * (3.154e7 / timeRemaining)).toFixed(0));
  const apy = Number((Math.pow(1 + apr / 100 / 365, 365) - 1) * 100);

  return apy;
};
export interface StastsAPR {
  roi: {
    d1: number;
    d7: number;
    d30: number;
    d365: number;
  };
  sefiP1000: {
    d1: number;
    d7: number;
    d30: number;
    d365: number;
  };
  usdP1000: {
    d1: number;
    d7: number;
    d30: number;
    d365: number;
  };
  apr: number;
  apy: number;
}
export const getAPRStats = (token: RewardsToken, price: number): StastsAPR => {
  // console.log(Math.round(Date.now() / 1000000))
  // deadline - current time, 6 seconds per block
  const timeRemaining = (Math.min(token.deadline, 7916452) - 427936) * 6.2 + 1634215386 - Math.round(Date.now() / 1000);

  // (token.deadline - Math.round(Date.now() / 1000000) );
  const pending = Number(divDecimals(token.remainingLockedRewards, token.rewardsDecimals)) * price;

  // this is already normalized
  const locked = Number(token.totalLockedRewards);
  //console.log(`pending - ${pending}; locked: ${locked}, time remaining: ${timeRemaining}`)

  const apr_raw = (pending * 100.0 / locked) * (3.154e7 / timeRemaining);
  const apr = apr_raw / 100.0;
  const apy = Number((Math.pow(1 + apr / 100 / 365, 365) - 1) * 100);
  const daysOfYear = 365;
  const roi = {
    d1: apr / daysOfYear,
    d7: Math.pow(1 + apr / daysOfYear, 7) - 1,
    d30: Math.pow(1 + apr / daysOfYear, 30) - 1,
    d365: Math.pow(1 + apr / daysOfYear, daysOfYear) - 1,
  };
  const sefiP1000 = {
    d1: (1000 * roi.d1) / price,
    d7: (1000 * roi.d7) / price,
    d30: (1000 * roi.d30) / price,
    d365: (1000 * roi.d365) / price,
  };
  const usdP1000 = {
    d1: sefiP1000.d1 * price,
    d7: sefiP1000.d7 * price,
    d30: sefiP1000.d30 * price,
    d365: sefiP1000.d365 * price,
  };
  const result: StastsAPR = {
    roi,
    sefiP1000,
    usdP1000,
    apy,
    apr,
  };
  return result;
};

const multipliers = {
  'SEFI STAKING (V2)': '40',
  'sUSDC - sUSDC(BSC)': '20',
  'sETH - sETH(BSC)': '12',
  'sSCRT - sUSDT': '28',
  'sSCRT - sETH': '36',
  'sSCRT - sWBTC': '36',
  'sSCRT - SEFI': '52',
  'SEFI - sXMR': '12',
  'SEFI - sUSDC': '24',
  'sETH - sWBTC': '12',
  'sSCRT - sBNB(BSC)': '12',
  'SEFI - sATOM': '8',
  'SEFI - sLUNA': '12',
  'SEFI - sOSMO': '4',
  'SEFI - sDVPN': '4',
  'sSCRT - sRUNE': '2'
};

const tokenImages = {
  'AAVE': '/static/token-images/aave_ethereum.svg',
  'ADA(BSC)': '/static/token-images/ada_binance.svg',
  'ALPHA': '/static/token-images/alpha_ethereum.svg',
  'ATOM': '/static/atom.png',
  'BAC': '/static/token-images/bac_ethereum.svg',
  'BAKE': '/static/token-images/bake_binance.svg',
  'BAND': '/static/token-images/band_ethereum.svg',
  'BAT': '/static/token-images/bat_ethereum.svg',
  'BCH(BSC)': '/static/token-images/bch_binance.svg',
  'BNB(BSC)': '/static/token-images/bnb_binance.svg',
  'BUNNY': '/static/token-images/bunny_binance.svg',
  'BUSD(BSC)': '/static/token-images/busd_binance.svg',
  'CAKE': '/static/token-images/cake_binance.svg',
  'COMP': '/static/token-images/comp_ethereum.svg',
  'DAI': '/static/token-images/dai_ethereum.svg',
  'DOGE(BSC)': '/static/token-images/doge_binance.svg',
  'DOT(BSC)': '/static/token-images/dot_binance.svg',
  'DPI': '/static/token-images/dpi_ethereum.svg',
  'DVPN': '/static/dvpn.png',
  'ENJ': '/static/token-images/enj_ethereum.svg',
  'ETH': '/static/token-images/eth_ethereum.svg',
  'ETH(BSC)': '/static/token-images/eth_binance.svg',
  'FINE': '/static/token-images/fine_binance.svg',
  'KNC': '/static/token-images/knc_ethereum.svg',
  'LINA': '/static/token-images/lina_binance.svg',
  'LINK': '/static/token-images/link_ethereum.svg',
  'LINK(BSC)': '/static/token-images/link_binance.svg',
  'LTC(BSC)': '/static/token-images/ltc_binance.svg',
  'LUNA': '/static/luna.png',
  'MANA': '/static/token-images/mana_ethereum.svg',
  'MKR': '/static/token-images/mkr_ethereum.svg',
  'OCEAN': '/static/token-images/ocean_ethereum.svg',
  'OSMO': '/static/osmo.png',
  'REN': '/static/token-images/ren_ethereum.svg',
  'RENBTC': '/static/token-images/renbtc_ethereum.svg',
  'RSR': '/static/token-images/rsr_ethereum.svg',
  'RUNE': '/static/token-images/rune_ethereum.svg',
  'SEFI': '/static/token-images/sefi.svg',
  'SIENNA': '/static/token-images/sienna.svg',
  'SNX': '/static/token-images/snx_ethereum.svg',
  'SSCRT': '/static/token-images/sscrt.svg',
  'SUSHI': '/static/token-images/sushi_ethereum.svg',
  'TORN': '/static/token-images/torn_ethereum.svg',
  'TRX(BSC)': '/static/token-images/trx_binance.svg',
  'TUSD': '/static/token-images/tusd_ethereum.svg',
  'UNI': '/static/token-images/uni_ethereum.svg',
  'UNILP-WSCRT-ETH': '/static/token-images/unilp_ethereum.svg',
  'USDC': '/static/token-images/usdc_ethereum.svg',
  'USDC(BSC)': '/static/token-images/usdc_binance.svg',
  'USDT': '/static/token-images/usdt_ethereum.svg',
  'USDT(BSC)': '/static/token-images/usdt_binance.svg',
  'WBTC': '/static/token-images/wbtc_ethereum.svg',
  'XMR': '/static/sXMR.png',
  'XRP(BSC)': '/static/token-images/xrp_binance.svg',
  'XVS': '/static/token-images/xvs_binance.svg',
  'YFI': '/static/token-images/yfi_ethereum.svg',
  'YFL': '/static/token-images/yfl_ethereum.svg',
  'ZRX': '/static/token-images/zrx_ethereum.svg'
};

export const apyString = (token: RewardsToken) => {
  const apy = Number(calculateAPY(token, Number(token.rewardsPrice), Number(token.price)));
  if (isNaN(apy) || 0 > apy) {
    return `∞%`;
  }
  const apyStr = zeroDecimalsFormatter.format(Number(apy));

  //Hotfix of big % number
  const apyWOCommas = apyStr.replace(/,/g, '');
  const MAX_LENGHT = 9;
  if (apyWOCommas.length > MAX_LENGHT) {
    const abrev = apyWOCommas?.substring(0, MAX_LENGHT);
    const abrevFormatted = zeroDecimalsFormatter.format(Number(abrev));
    const elevation = apyWOCommas.length - MAX_LENGHT;

    return `${abrevFormatted}e${elevation} %`;
  }
  return `${apyStr}%`;
};

export const aprString = (token: RewardsToken) => {
  const { apr } = getAPRStats(token, Number(token.rewardsPrice));
  // if (isNaN(apy) || 0 > apy) {
  //   return `∞%`;
  // }
  // const apyStr = zeroDecimalsFormatter.format(Number(apy));

  // //Hotfix of big % number
  // const apyWOCommas = apyStr.replace(/,/g, '');
  // const MAX_LENGHT = 9;
  // if (apyWOCommas.length > MAX_LENGHT) {
  //   const abrev = apyWOCommas?.substring(0, MAX_LENGHT);
  //   const abrevFormatted = zeroDecimalsFormatter.format(Number(abrev));
  //   const elevation = apyWOCommas.length - MAX_LENGHT;

  //   return `${abrevFormatted}e${elevation} %`;
  // }
  return numeral(apr).format('0,0%');
};
export interface RewardsToken {
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
  deprecated?: boolean;
  deprecated_by?: string;
  zero?: boolean;
}
@observer
class EarnRow extends Component<
  {
    userStore: UserStoreEx;
    token: RewardsToken;
    notify: Function;
    callToAction: string;
    theme: Theme;
    isSefiStaking?: boolean;
  },
  {
    activeIndex: Number;
    depositValue: string;
    withdrawValue: string;
    claimButtonPulse: boolean;
    pulseInterval: number;
    secondary_token: any;
  }
> {
  state = {
    activeIndex: -1,
    depositValue: '0.0',
    withdrawValue: '0.0',
    claimButtonPulse: true,
    pulseInterval: -1,
    secondary_token: {
      image: '',
      symbol: '',
    },
  };
  componentDidMount() {
    //auto open for SEFI STAKING page
    if (this.props.isSefiStaking) {
      setTimeout(() => {
        this.handleClick('', { index: 0 });
      }, 100);
    }
  }

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
      this.props.userStore.refreshTokenBalanceByAddress(this.props.token.lockedAssetAddress);
      this.props.userStore.refreshRewardsBalances('', this.props.token.rewardsContract);
    }
    this.setState({ activeIndex: newIndex });
  };

  togglePulse = () =>
    this.setState(prevState => ({
      claimButtonPulse: !prevState.claimButtonPulse,
    }));

  clearPulseInterval = () => clearInterval(this.state.pulseInterval);

  setPulseInterval = interval => this.setState({ pulseInterval: interval });

  unCapitalize = s => {
    if (typeof s !== 'string') {
      return '';
    }
    return s.charAt(0).toLowerCase() + s.slice(1);
  };
  getBaseTokenName = (tokenName: string): string => {
    if (!tokenName) {
      return '';
    }

    tokenName = tokenName.toUpperCase();

    if (tokenName == 'SSCRT' || tokenName == 'SEFI' || tokenName == 'SCRT') {
      return tokenName;
    } else {
      if (tokenName.charAt(0) == 'S') {
        return tokenName.slice(1);
      } else {
        return tokenName;
      }
    }
  };
  render() {
    // const style = Number(this.props.token.balance) > 0 ? styles.accordionHaveDeposit : `${styles.accordion} ${styles[this.props.theme.currentTheme]}`;
    const style = `${styles.accordion} ${styles[this.props.theme.currentTheme]}`;
    //this.props.userStore.keplrWallet.suggestToken(this.props.userStore.chainId, );
    const { activeIndex } = this.state;
    const _symbols = this.props.token.lockedAsset?.toUpperCase().split('-');
    let image_primaryToken, image_secondaryToken;
    let tokenName1 = this.getBaseTokenName(_symbols[1]);
    let tokenName2 = this.getBaseTokenName(_symbols[2]);

    // Overide the image for each token
    if (tokenImages[tokenName1]) {
      image_primaryToken = tokenImages[tokenName1];
    }
    if (tokenImages[tokenName2]) {
      image_secondaryToken = tokenImages[tokenName2];
    }

    let tokenName;
    if (_symbols[1] == 'SEFI') {
      tokenName = _symbols[1] + ' - ' + this.unCapitalize(_symbols[2]);
    } else if (_symbols[2] == 'SEFI') {
      tokenName = this.unCapitalize(_symbols[1]) + ' - ' + _symbols[2];
    } else {
      tokenName = this.unCapitalize(_symbols[1]) + ' - ' + this.unCapitalize(_symbols[2]);
    }
    const isDeprecated = this.props.token.deprecated && this.props.token.deprecated_by !== '';
    let title = '';
    if (isDeprecated) {
      title = this.props.token.display_props.label === 'SEFI' ? 'SEFI STAKING (OLD)' : `${tokenName} (OLD)`;
    } else if (this.props.token.display_props.label === 'SEFI') {
      title = 'SEFI STAKING (V2)';
    } else {
      title = tokenName;
    }

    return (
      <Accordion className={cn(style)}>
        <Accordion.Title
          active={activeIndex === 0}
          index={0}
          onClick={this.handleClick}
          className={`${styles.assetRow} ${styles.responsive_row}`}
        >
          {this.props.token.lockedAsset === 'SEFI' ? (
            <div className={cn(styles.assetIcon)}>
              <Image src={tokenImages.SEFI} rounded size="mini" />
            </div>
          ) : (
            <div className={cn(styles.assetIcon)}>
              <Image src={image_primaryToken} rounded size="mini" />
              <Image src={image_secondaryToken} rounded size="mini" />
            </div>
          )}

          <div className={cn(styles.title_item__container)}>
            <SoftTitleValue title={title} subTitle="    " />
          </div>

          <div className={cn(styles.title_item__container)}>
            <SoftTitleValue
              title={
                <div className="earn_center_ele">
                  {aprString(this.props.token)}
                  {!isDeprecated && !this.props.token.zero && (
                    <p style={{ marginLeft: '5px', fontFamily: 'poppins', fontSize: '17px' }}>
                      <ModalExplanation token={this.props.token} theme={this.props.theme}>
                        <img width="14px" src="/static/info.svg" alt="" />
                      </ModalExplanation>
                    </p>
                  )}
                </div>
              }
              subTitle={'APR'}
            />
          </div>
          <div className={cn(styles.title_item__container)}>
            <SoftTitleValue
              title={`$${formatZeroDecimals(Number(this.props.token.totalLockedRewards) || 0)}`}
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

          {/undefined/.test(multipliers[title]) ? (
            <div />
          ) : (
          <div className={cn(styles.title_item__container)}>
            <SoftTitleValue
              title={
                <div className="earn_center_ele">
                  {multipliers[title] + 'x'}
                  <p style={{ marginLeft: '5px', fontFamily: 'poppins', fontSize: '17px' }}>
                    <ModalMultiplierTip multiplier={multipliers[title]} theme={this.props.theme}>
                      <img width="14px" src="/static/info.svg" alt="" />
                    </ModalMultiplierTip>
                  </p>
                </div>
              }
              subTitle={'Multiplier'}
            />
          </div>
          )}

          <Icon
            className={`${styles.arrow}`}
            style={{
              color: this.props.theme.currentTheme == 'dark' ? 'white' : '',
            }}
            name="dropdown"
          />
        </Accordion.Title>
        <Accordion.Content
          className={`${styles.content} ${styles[this.props.theme.currentTheme]}`}
          active={activeIndex === 0}
        >
          {this.props.token.deprecated ? (
            <div className="maintenance-warning">
              <h3>
                <Icon name="warning circle" />A new version of this earn pool is live. You can migrate by clicking the
                button below
              </h3>
            </div>
          ) : (
            <></>
          )}

          <div>
            <Segment basic>
              <Grid className={cn(styles.content2)} columns={2} relaxed="very" stackable>
                <Grid.Column>
                  {isDeprecated ? (
                    <>
                      <h1 style={{ color: this.props.theme.currentTheme == 'dark' ? 'white' : '#1B1B1B' }}>
                        Earn on the new pool!
                      </h1>
                      <MigrateAssets
                        balance={this.props.token.deposit}
                        oldRewardsContract={this.props.token.rewardsContract}
                        newRewardsContract={this.props.token.deprecated_by}
                        lockedAsset={this.props.token.lockedAsset}
                        lockedAssetAddress={this.props.token.lockedAssetAddress}
                      >
                        <p style={{ color: this.props.theme.currentTheme == 'dark' ? 'white' : '#1B1B1B' }}>
                          Migrate your tokens here.
                          <button className={`migrate-solid-button ${stores.theme.currentTheme}`}>Migrate</button>
                        </p>
                      </MigrateAssets>
                    </>
                  ) : (
                    <DepositContainer
                      title="Earn"
                      value={this.state.depositValue}
                      action={
                        !isDeprecated && (
                          <>
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
                          </>
                        )
                      }
                      onChange={this.handleChangeDeposit}
                      balance={this.props.token.balance}
                      currency={this.props.token.lockedAsset}
                      price={this.props.token.price}
                      balanceText="Available"
                      unlockPopupText="Staking balance and rewards require an additional viewing key."
                      tokenAddress={this.props.token.lockedAssetAddress}
                      userStore={this.props.userStore}
                      theme={this.props.theme}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  <DepositContainer
                    title="Withdraw"
                    value={this.state.withdrawValue}
                    onChange={this.handleChangeWithdraw}
                    action={
                      <Grid columns={1} stackable relaxed={'very'}>
                        <Grid.Column
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-start',
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
                    currency={this.props.token.lockedAsset}
                    price={this.props.token.price}
                    balanceText="Staked"
                    unlockPopupText="Staking balance and rewards require an additional viewing key."
                    tokenAddress={this.props.token.rewardsContract}
                    userStore={this.props.userStore}
                    theme={this.props.theme}
                  />
                </Grid.Column>
              </Grid>
            </Segment>
          </div>
          <ClaimBox
            balance={this.props.token.deposit}
            unlockPopupText="Staking balance and rewards require an additional viewing key."
            available={this.props.token.rewards}
            userStore={this.props.userStore}
            rewardsContract={this.props.token.rewardsContract}
            symbol={this.props.token.display_props.symbol}
            notify={this.props.notify}
            rewardsToken={this.props.token.rewardsSymbol || 'sSCRT'}
            deprecated={isDeprecated}
          />
          <Text
            size="medium"
            style={{
              padding: '20 20 0 20',
              cursor: 'auto',
              textAlign: 'center',
              fontFamily: 'Poppins,Arial',
              color: this.props.theme.currentTheme == 'dark' ? 'white' : '#1B1B1B',
            }}
          >
            * Every time you deposit, withdraw or claim the contract will automagically claim your rewards for you!
          </Text>
        </Accordion.Content>
      </Accordion>
    );
  }
}

export default EarnRow;
