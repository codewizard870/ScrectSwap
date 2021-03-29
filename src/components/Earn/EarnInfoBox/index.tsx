import React from 'react';
import { Message } from 'semantic-ui-react';

type EarnType = 'LPSTAKING' | 'BRIDGE_MINING';

const EarnInfoBox = ({ type }: { type: EarnType }) => {
  if (type === 'LPSTAKING') {
    return (
      <Message info>
        <Message.Header>LP Staking</Message.Header>
        <p>Some description of what lp staking is</p>
      </Message>
    );
  } else {
    return (
      <Message info>
        <Message.Header>Bridge Mining</Message.Header>
        <p>Some description of what bridge mining is</p>
      </Message>
    );
  }
};

export default EarnInfoBox;