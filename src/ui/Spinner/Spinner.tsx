import * as React from 'react';
import styles from './Spinner.styl';

export const Spinner: React.FC<React.SVGAttributes<SVGElement>> = props => {
  const boxSize = 16;
  const radius = boxSize / 2 - 1;
  const middle = boxSize / 2;
  return (
    <div className={styles.spinnerContainer}>
      <svg viewBox={`0 0 ${boxSize} ${boxSize}`} className={styles.spinner} {...props}>
        <circle
          r={radius}
          cx={middle}
          cy={middle}
          strokeWidth="0"
          fill="none"
          stroke={props.color || 'black'}
          strokeDasharray={Math.floor(2 * radius * Math.PI - 6)}
        />
      </svg>
    </div>
  );
};
