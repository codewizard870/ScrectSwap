import * as styles from './styles.styl';
import cn from 'classnames';
import React from 'react';
import { Text } from '../../../components/Base/components/Text';
import LocalStorageTokens from '../../../blockchain-bridge/scrt/CustomTokens';
import { useStores } from 'stores';

export const ClearCustomTokensButton = () => {
  const {theme} = useStores();
  return (
    <button
      className={`${styles.clearTokenButton} ${styles.ripple} ${styles[theme.currentTheme]}`}
      onClick={() => {
        LocalStorageTokens.clear();
      }}
    >
      <Text size="medium" color={(theme.currentTheme == 'light')?'red':'#DEDEDE'}>
        Clear Custom Tokens
      </Text>
    </button>
  );
};
