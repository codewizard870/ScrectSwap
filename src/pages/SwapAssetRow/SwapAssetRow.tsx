import BigNumber from 'bignumber.js';
import React from 'react';
import { displayHumanizedBalance, humanizeBalance } from 'utils';
import { Button, Container } from 'semantic-ui-react';
import Loader from 'react-loader-spinner';
import { TokenSelector } from '../TokenModal/TokenSelector/TokenSelector';
import { SwapInput } from '../../components/Swap/SwapInput';
import { SigningCosmWasmClient } from 'secretjs';
import { SwapTokenMap } from '../TokenModal/types/SwapToken';
import { CosmWasmClient } from 'secretjs';
import { FlexRowSpace } from '../../components/Swap/FlexRowSpace';
import { useStores } from 'stores';
import * as styles from './styles.styl'

export const SwapAssetRow = ({
  tokens,
  token,
  setToken,
  amount,
  setAmount,
  isEstimated,
  balance,
  label,
  maxButton,
  secretjs,
  error,
  disabled,
}: {
  tokens: SwapTokenMap;
  token: string;
  setToken: (symbol: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  isEstimated: boolean;
  balance: BigNumber | JSX.Element;
  label: string;
  maxButton: boolean;
  secretjs: CosmWasmClient;
  disabled?: boolean;
  error?: boolean;
}) => {
  const {theme} = useStores()
  const font = {
    fontWeight: 400,
    fontSize: '16px',
    color: (theme.currentTheme == 'light')?'#5F5F6B':'#DEDEDE',
    fontFamily:'Poppins,Arial, Helvetica, sans-serif'
  };
  const balanceStyle ={
    display:'flex',
    padding: '.5rem 1rem',
    ...font,
  }

  return (
    <Container
      style={{ 
        borderRadius: '20px',
        border: '1px solid rgb(247, 248, 250)',
      }}
      id={styles.SwapAssetRow_container}
    >
      <div
        style={{
          display: 'flex',
        }}
      >
        <span
          style={{
            fontWeight: 500,
            fontSize: '14px',
            color: (theme.currentTheme == 'light')?'#5F5F6B':'#DEDEDE',
          }}
        >
          {label}
          {isEstimated ? ` (estimated)` : null}
        </span>
        <FlexRowSpace />
        {token && (
          <div style={balanceStyle}>
            {'Balance: '}
            {(() => {
              if (balance === undefined) {
                return (
                  <>
                    <span style={balanceStyle} />
                    <Loader type="ThreeDots" color="#ff726e" height="1em" width="1em" style={{ margin: 'auto' }} />
                  </>
                );
              }

              if (JSON.stringify(balance).includes('View')) {
                return balance;
              }

              if (tokens.size > 0) {
                const hum = displayHumanizedBalance(
                  humanizeBalance(new BigNumber(balance as BigNumber), tokens.get(token)?.decimals),
                  BigNumber.ROUND_DOWN,
                );
                return (isNaN(parseFloat(hum)))?0:hum
              }
              return undefined;
            })()}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <SwapInput
          value={amount}
          error={error}
          disabled={disabled}
          setValue={value => {
            if (isNaN(Number(value))) {
              return;
            }
            setAmount(value);
          }}
          width="36%"
        />
        <FlexRowSpace />
        {maxButton && token && (
          <Button
            basic
            className={`${styles[theme.currentTheme]} ${styles.max_button}`}
            disabled={new BigNumber(balance as any).isNaN()} 
            onClick={() => {
              const { decimals } = tokens.get(token);

              let leftoverForGas = 0;
              if (token === 'uscrt') {
                leftoverForGas = 0.5;
              }

              setAmount(
                humanizeBalance(new BigNumber(balance as any), decimals)
                  .minus(leftoverForGas)
                  .toFixed(decimals),
              );
            }}
          >
            <span>MAX</span>
          </Button>
        )}
        <TokenSelector
          secretjs={secretjs}
          tokens={Array.from(tokens.values())}
          token={token ? tokens.get(token) : undefined}
          onClick={token => {
            setToken(token);
          }}
        />
      </div>
    </Container>
  );
};
