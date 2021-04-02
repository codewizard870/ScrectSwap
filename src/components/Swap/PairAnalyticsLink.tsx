import React from 'react';
import * as styles from './style.styl';
export const PairAnalyticsLink: React.FC<{ pairAddress: string }> = ({ pairAddress }) => {
  if (!pairAddress) {
    return null;
  }

  return (
    <div
      className={styles.analyticsLink_container}
    >
      <a className={styles.link} href={`https://secretanalytics.xyz/${pairAddress}`} target="_blank" rel={'noreferrer'}>
        <strong>View pair analytics ↗</strong>
      </a>
    </div>
  );
};
