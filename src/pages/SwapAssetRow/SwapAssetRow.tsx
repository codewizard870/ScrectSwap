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
}) => {
  const font = {
    fontWeight: 400,
    fontSize: '16px',
    color: '#5F5F6B',
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
        padding: '1rem',
        borderRadius: '20px',
        border: '1px solid rgb(247, 248, 250)',
        backgroundColor: 'white',
      }}
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
            color: 'rgb(86, 90, 105)',
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
                    <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" style={{ margin: 'auto' }} />
                  </>
                );
              }

              if (JSON.stringify(balance).includes('View')) {
                return balance;
              }

              if (tokens.size > 0) {
                return displayHumanizedBalance(
                  humanizeBalance(new BigNumber(balance as BigNumber), tokens.get(token).decimals),
                  BigNumber.ROUND_DOWN,
                );
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
          disabled={disabled}
          setValue={value => {
            if (isNaN(Number(value))) {
              return;
            }
            setAmount(value);
          }}
        />
        <FlexRowSpace />
        {maxButton && token && (
          <Button
            basic
            disabled={new BigNumber(balance as any).isNaN()}
            style={{
              marginRight:'2rem',
              color:'#5F5F6B' ,
              border:'1px solid #5F5F6B' ,
              borderRadius: '15px',
              fontSize: '12px',
              fontWeight: 700,
              width:'63px',
              height: '26px',
              padding: '4px 12px',
            }}
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
            MAX
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
