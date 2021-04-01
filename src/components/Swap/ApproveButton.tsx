import React from 'react';
import { Button } from 'semantic-ui-react';

const buttonStyle = {
  background: '#1B1B1B',
  margin: '1em 0 0 0',
  borderRadius: '4px',
  padding: '11px, 42px, 11px, 42px',
  fontSize: '16px',
  height: '46px',
  fontWeight: '600'
};

export const ApproveButton = (props: { disabled: boolean; loading: boolean; onClick: any; token: string }) => (
  <Button disabled={props.disabled} loading={props.loading} primary fluid style={buttonStyle} onClick={props.onClick}>
    {`Approve ${props.token}`}
  </Button>
);
