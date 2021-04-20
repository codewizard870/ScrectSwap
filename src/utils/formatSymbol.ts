import { EXCHANGE_MODE } from 'stores/interfaces';

export const formatSymbol = (mode: EXCHANGE_MODE, symbol: string) => {
  if (!symbol || symbol.trim() === '') return '';
  let value = symbol;
  value = mode === EXCHANGE_MODE.TO_SCRT ? symbol : `secret${symbol}`;
  if (symbol === 'SSCRT') value = mode === EXCHANGE_MODE.TO_SCRT ? 'WSCRT' : `secretSCRT`;
  return value;
};
