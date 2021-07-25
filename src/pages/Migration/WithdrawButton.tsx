import React, { useState } from 'react';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';

const WithdrawButton = ({ isDisabled, withdraw }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {theme} = useStores();

  return (
    <Button
      loading={loading}
      className={`${styles.button} ${styles[theme.currentTheme]}`}
      disabled={isDisabled}
      onClick={async () => {
        setLoading(true);
        await withdraw();
        setLoading(false);
      }}
    >
      Withdraw
    </Button>
  );
};

export default WithdrawButton;
