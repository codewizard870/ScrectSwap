import React, { useState } from 'react';
import * as styles from './styles.styl';
import cn from 'classnames';

const EarnSelectorHeader = (props: { setValue }) => {
  const [selected, setSelected] = useState<boolean>(false);

  return (
    <div className={cn(styles.itemToken)}>
      <button
        className={cn(styles.button)}
        onClick={() => {
          setSelected(true);
          props.setValue(true);
        }}
        disabled={selected}
      >
        LP STAKING
      </button>
      <button
        className={cn(styles.button)}
        onClick={() => {
          setSelected(false);
          props.setValue(false);
        }}
        disabled={!selected}
      >
        BRIDGE MINING
      </button>
    </div>
  );
};

export default EarnSelectorHeader;
