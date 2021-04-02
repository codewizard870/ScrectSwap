import { Input } from 'semantic-ui-react';
import React from 'react';
import * as styles from './style.styl';

export const SwapInput = (props: {
  value: string;
  setValue: any;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}) => {
  return (
    <Input
      disabled={props.disabled === true}
      style={{
        padding: 0,
        width: props.width || '180px',
      }}
      className={styles.customInput}
      transparent
      size="massive"
      placeholder={props.placeholder || '0.0'}
      value={props.value}
      onChange={(_, { value }: { value: string }) => {
        props.setValue(value);
      }}
    />
  );
};
