import React, { useEffect, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import * as style from './style.styl';
import { FlexRowSpace } from './FlexRowSpace';
import { useStores } from 'stores';

const numberFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 6,
  useGrouping: true,
});

export const PriceRow = ({
  price,
  fromToken,
  toToken,
  labelPrefix,
}: {
  price: number;
  fromToken: string;
  toToken: string;
  labelPrefix?: string;
}) => {
  const [tokens, setTokens] = useState({
    from: toToken,
    to: fromToken,
    price: numberFormat.format(1 / price), // prevents price distortion from multiple clicks
    priceInvert: numberFormat.format(price),
  });
  const [iconBackground, setIconBackground] = useState('whitesmoke');

  useEffect(() => {
    setTokens({
      from: toToken,
      to: fromToken,
      price: numberFormat.format(1 / price), // prevents price distortion from multiple clicks
      priceInvert: numberFormat.format(price),
    });
  }, [fromToken, toToken, price]);
  const {theme} = useStores();
  return (
    <>
      <div
        className={`${style.priceRow_container} ${style[theme.currentTheme]}`}
      >
        {labelPrefix}Price
        <FlexRowSpace />
        {`${tokens.price} ${tokens.from} per ${tokens.to}`}
        <Icon
          circular
          size="small"
          name="exchange"
          style={{
            margin: '0 0 0 0.3em',
            background: (theme.currentTheme == 'light')?'whitesmoke':'rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setIconBackground('rgb(237, 238, 242)')}
          onMouseLeave={() => setIconBackground('whitesmoke')}
          onClick={() => {
            setTokens({
              from: tokens.to,
              to: tokens.from,
              price: tokens.priceInvert,
              priceInvert: tokens.price, // prevents price distortion from multiple clicks
            });
          }}
        />
      </div>
    </>
  );
};
