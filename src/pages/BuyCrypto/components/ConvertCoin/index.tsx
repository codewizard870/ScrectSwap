import { unlockJsx } from 'components/Header/utils';
import React from 'react';
import { Button, Input } from 'semantic-ui-react';
import { formatWithSixDecimals, unlockToken } from 'utils';
import './style.scss';

const FEE = 0.04;

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance: string;
}

const ConvertCoin = ({
  title,
  theme,
  learn_link,
  description,
  token,
  amount,
  loading,
  style,
  notify,
  createVK,
  onSubmit,
  setAmount,
}: ConvertCoinProps) => {
  const isDark = theme == 'dark';

  const setWithdrawPercentage = (n: number) => {
    const a = parseFloat(token.balance);
    if (isNaN(a) || !a) {
      return;
    }
    let amount_formatted :number= 0;
    if (token.symbol == 'SCRT') {
      amount_formatted = parseFloat(formatWithSixDecimals(a * n - FEE));
    } else {
      amount_formatted = parseFloat(formatWithSixDecimals(a * n));
    }

    if (amount_formatted < 0 || isNaN(amount_formatted)){
      notify('error',`Insuficcient balance to ${title} ${n * 100} %`)
      return;
    }

    setAmount(amount_formatted.toString());
    console.log('amount_formatted', amount_formatted);
  };

  return (
    <div style={style} className={`${theme} convert-wrapper`}>
      <h2>{title}</h2>
      <p className="description">{description}</p>
      {/*<p className="convert-learn-more">*/}
      {/*  <a href={learn_link}>Click here to learn more</a>*/}
      {/*</p>*/}
      <section className="contenas">
        <div className="row">
          <p>Available</p>
          {token.balance == unlockToken || !token.balance ? (
            <p>
              {unlockJsx({ onClick: createVK })} {token.symbol}
            </p>
          ) : (
            <p>{`${token.balance} ${token.symbol}`}</p>
          )}
        </div>
        <Input
          inverted={isDark}
          placeholder="0"
          className="convert-input"
          type="number"
          size="large"
          value={amount}
          onChange={e => {
            setAmount(e.target.value);
          }}
        />
        <div className="row">
          <Button inverted={isDark} basic onClick={() => setWithdrawPercentage(0.25)}>
            25%
          </Button>
          <Button inverted={isDark} basic onClick={() => setWithdrawPercentage(0.5)}>
            50%
          </Button>
          <Button inverted={isDark} basic onClick={() => setWithdrawPercentage(0.75)}>
            75%
          </Button>
          <Button inverted={isDark} basic onClick={() => setWithdrawPercentage(1)}>
            100%
          </Button>
        </div>
        <Button loading={loading} inverted={isDark} secondary={!isDark} onClick={onSubmit}>
          {title}
        </Button>
      </section>
    </div>
  );
};

export default ConvertCoin;

interface ConvertCoinProps {
  title: string;
  description: string | JSX.Element;
  theme: string;
  learn_link: string;
  loading: boolean;
  token: Token;
  amount: string;
  style?: {};
  createVK?: () => void;
  notify: Function;
  setAmount: (n: string) => void;
  onSubmit: () => void;
}
