import React, { useState } from 'react';
import * as styles from './styles.styl';
import { Button } from 'semantic-ui-react';
import { useStores } from 'stores';

const EarnButton = ({ isDisabled, deposit }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {theme}= useStores();
  return (
    <Button
      loading={loading}
      className={`${styles.button} ${styles[theme.currentTheme]}`}
      disabled={isDisabled}
      onClick={async () => {
        setLoading(true);
        await deposit();
        setLoading(false);
      }}
    >
      { isDisabled ? "Nothing to migrate" : 'Earn'}
    </Button>
  );
};

export default EarnButton;
