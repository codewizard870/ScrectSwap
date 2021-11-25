import React, { useState, useEffect } from 'react';
import { BaseContainer, PageContainer } from 'components';
import { ConvertCoin, Token } from './components';
import { observer } from 'mobx-react';
import { useStores } from 'stores';
import { unlockToken, valueToDecimals } from 'utils';
import { unlockJsx } from 'components/Header/utils';
import { notify } from '../../blockchain-bridge/scrt/utils';
import './style.scss';

const SSCRT: Token = {
  address: process.env.SSCRT_CONTRACT,
  symbol: 'SSCRT',
  decimals: 6,
  balance: '0',
};

const BuyCrypto = observer(() => {
  const { theme, user } = useStores();
  const [amountWrap, setAmountWrap] = useState<string>('');
  const [amountUnwrap, setAmountUnwrap] = useState<string>('');
  const [unwrapLoading, setUnwrapLoading] = useState<boolean>(false);
  const [wrapLoading, setWrapLoading] = useState<boolean>(false);
  const [tokenSelected, setTokenSelected] = useState<Token>(SSCRT);

  const SCRT: Token = {
    address: '',
    balance: user.balanceSCRT,
    symbol: 'SCRT',
    // decimals 0 because it's already parsed to it's decimals
    decimals: 0,
  };

  useEffect(() => {
    const SSCRT: Token = {
      address: process.env.SSCRT_CONTRACT,
      symbol: 'SSCRT',
      decimals: 6,
      balance: user.balanceToken[process.env.SSCRT_CONTRACT],
    };
    setTokenSelected(SSCRT);
  }, [user.balanceToken[process.env.SSCRT_CONTRACT]]);

  async function wrapToken(amount: string, token: Token, callback?: Function) {
    try {
      setWrapLoading(true);
      //inputs 1 -> 1000000
      const amount_convert = valueToDecimals(amount, token.decimals.toString());
      const res = await user.secretjsSend.asyncExecute(token.address, { deposit: {} }, '', [
        { denom: 'uscrt', amount: amount_convert },
      ]);
      notify('success', 'converted ');
      await user.updateSScrtBalance();
      await user.updateScrtBalance();
      callback();
    } catch (error) {
      notify('error', error);
    } finally {
      setAmountWrap('');
      setWrapLoading(false);
    }
  }

  async function unWrapToken(amount: string, token: Token, callback?: Function) {
    try {
      setUnwrapLoading(true);
      //inputs 1 -> 1000000
      const amount_convert = valueToDecimals(amount, token.decimals.toString());
      const res = await user.secretjsSend.asyncExecute(token.address, { redeem: { amount: amount_convert } });
      notify('success', 'converted ');

      await user.updateSScrtBalance();
      await user.updateScrtBalance();
      callback();
    } catch (error) {
      notify('error', error);
    } finally {
      setAmountUnwrap('');
      setUnwrapLoading(false);
    }
  }

  const createVK = async (token: Token) => {
    try {
      await user.keplrWallet.suggestToken(user.chainId, token.address);
      await user.updateBalanceForRewardsToken(token.address);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <BaseContainer>
      <PageContainer>
        <main className={`${theme.currentTheme} buy-base-container`}>
          <section className="balances-container">
            <div>
              <p>SCRT Balance</p>
              <p>
                <strong>{user.balanceSCRT}</strong>
              </p>
            </div>
            <div>
              <p>sSCRT Balance</p>
              <p>
                {unlockToken === user.balanceToken[process.env.SSCRT_CONTRACT] ? (
                  unlockJsx({ onClick: () => createVK(tokenSelected) })
                ) : (
                  <strong>{user.balanceToken[process.env.SSCRT_CONTRACT]}</strong>
                )}
              </p>
            </div>
          </section>
          <section className="buy-convert-grid">
            <div className="transak-container">
              <h1>Buy</h1>
              <div>
                <iframe
                  height="650"
                  width="450"
                  title="Transak On/Off Ramp Widget (Website)"
                  src={process.env.TRANSAK_URL}
                  frameBorder="no"
                  allowTransparency={true}
                  allowFullScreen={false}
                />
              </div>
            </div>
            <div className="convert-container">
              <h1>Convert</h1>
              <ConvertCoin
                title="Wrap"
                description="Convert SCRT to sSCRT, the privacy preserving version of SCRT."
                theme={theme.currentTheme}
                learn_link=""
                token={SCRT}
                onSubmit={() => wrapToken(amountWrap, tokenSelected)}
                amount={amountWrap}
                notify={notify}
                loading={wrapLoading}
                setAmount={setAmountWrap}
              />
              <ConvertCoin
                createVK={() => createVK(tokenSelected)}
                style={{ marginTop: '30px' }}
                title="Unwrap"
                description="Convert sSCRT to SCRT, Secret Network's native public token."
                theme={theme.currentTheme}
                learn_link=""
                token={tokenSelected}
                onSubmit={() => unWrapToken(amountUnwrap, tokenSelected)}
                amount={amountUnwrap}
                notify={notify}
                loading={unwrapLoading}
                setAmount={setAmountUnwrap}
              />
            </div>
          </section>
        </main>
      </PageContainer>
    </BaseContainer>
  );
});

export default BuyCrypto;
