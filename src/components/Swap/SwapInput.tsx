import { Input } from 'semantic-ui-react';
import React from 'react';
import * as styles from './style.styl';
import { useStores } from 'stores';

export const SwapInput = (props: {
  value: string;
  setValue: any;
  error?: boolean;
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}) => {
  const {theme} =useStores();
  return (
    <Input
      disabled={props.disabled === true}
      style={{
        padding: 0,
        width: props.width || '180px',
        
      }}
      className={`${styles.customInput} ${styles[theme.currentTheme]}`}
      transparent
      size="massive"
      placeholder={(props.error)?'-':props.placeholder || '0.0'}
      value={props.value}
      onChange={(_, { value }: { value: string }) => {
        props.setValue(value);
      }}
    />
  );
};
