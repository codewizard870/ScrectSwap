import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { Container, Popup, Icon } from 'semantic-ui-react';
import { useStores } from 'stores';
import { PairAnalyticsLink } from '../../components/Swap/PairAnalyticsLink';
import style from './styles.styl';
export const AdditionalInfo = ({
  minimumReceived,
  maximumSold,
  liquidityProviderFee,
  priceImpact,
  expectedCSHBK,
  fromToken,
  toToken,
  pairAddress,
}: {
  minimumReceived?: BigNumber;
  maximumSold?: BigNumber;
  liquidityProviderFee: number;
  isSupported: Boolean;
  priceImpact: number;
  expectedCSHBK: number;
  fromToken: string;
  toToken: string;
  pairAddress: string;
}) => {
  const [minReceivedIconBackground, setMinReceivedIconBackground] = useState<string>('whitesmoke');
  const [liqProvFeeIconBackground, setLiqProvFeeIconBackground] = useState<string>('whitesmoke');
  const [priceImpactIconBackground, setPriceImpactIconBackground] = useState<string>('whitesmoke');
  //isSupported = is pair of tokens supported to get CASHBACK token
  const { theme, user } = useStores();

  let priceImpactColor = 'green'; // Less than 1% - Awesome
  if (priceImpact > 0.05) {
    priceImpactColor = 'red'; // High
  } else if (priceImpact > 0.03) {
    priceImpactColor = 'orange'; // Medium
  } else if (priceImpact > 0.01) {
    priceImpactColor = 'black'; // Low
  }

  return (
    <div style={{ maxWidth: '450px', minWidth: '450px' }}>
      <Container className={`${style.additionalInfo_container} ${style[theme.currentTheme]}`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            {minimumReceived !== null ? 'Minimum Received' : 'Maximum Sold'}
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setMinReceivedIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setMinReceivedIconBackground('whitesmoke')}
                />
              }
              content="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed."
              position="top center"
            />
          </span>
          <strong>
            {minimumReceived !== null
              ? `${minimumReceived.toFormat(6)} ${toToken}`
              : `${maximumSold.toFormat(6)} ${fromToken}`}
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            Price Impact
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setPriceImpactIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setPriceImpactIconBackground('whitesmoke')}
                />
              }
              content="The difference between the market price and estimated price due to trade size."
              position="top center"
            />
          </span>
          <strong style={{ color: priceImpactColor }}>{`${
            priceImpact < 0.01 / 100
              ? '<0.01'
              : new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                  useGrouping: true,
                }).format(priceImpact * 100)
          }%`}</strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            Liquidity Provider Fee
            <Popup
              trigger={
                <Icon
                  name="help"
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    verticalAlign: 'middle',
                  }}
                  onMouseEnter={() => setLiqProvFeeIconBackground('rgb(237, 238, 242)')}
                  onMouseLeave={() => setLiqProvFeeIconBackground('whitesmoke')}
                />
              }
              content="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive."
              position="top center"
            />
          </span>
          <strong>
            {new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 10,
              useGrouping: true,
            }).format(liquidityProviderFee)}{' '}
            {fromToken}
          </strong>
        </div>
        {/* <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '0.2rem',
          }}
        >
          <span>
            Expected Cashback Rewards
            <Popup
            className={style.icon_info__popup} 
            // on='click'
              trigger={
                <Icon
                  name="info"
                  className={style.icon_info}
                  circular
                  size="tiny"
                  style={{
                    marginLeft: '0.5rem',
                    verticalAlign: 'middle',
                  }}
                />
              } 
              position="top center"
            >
              <Popup.Content>
                When users trade, they acquire cashback tokens.<br/> 
                These cashback tokens can be burned to claim SEFI. <br/>
                {/* <a href="#">Learn more about cashback tokens</a> 
              </Popup.Content>
            </Popup>
          </span>
          <strong>
            {expectedCSHBK}
          </strong>
        </div> */}
        <PairAnalyticsLink pairAddress={pairAddress} />
      </Container>
    </div>
  );
};
