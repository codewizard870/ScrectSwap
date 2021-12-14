import * as React from 'react';
import styles from './SpinnerLine.styl';

export const SpinnerLine: React.FC<React.SVGAttributes<SVGElement>> = props => {
  return <div className={styles.spinnerLine} style={props.style} />;
};
