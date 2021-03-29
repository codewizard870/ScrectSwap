import React from 'react';
import { Message } from 'semantic-ui-react';
import { TOKEN_USAGE } from '../../../stores/interfaces';

const EarnInfoBox = ({ type }: { type: TOKEN_USAGE }) => {
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