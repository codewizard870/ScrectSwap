import React from 'react';
import { Box } from 'grommet';
import { Title } from './Base/components/Title';
import * as styles from './info-styles.styl';

export const InfoEarn = ({ title }: { title: string }) => (
  <Box className={styles.infoContainer} pad={{ horizontal: 'large', top: 'large' }}>
    {title ? (
      <Box direction="row" justify="center" margin={{ bottom: 'medium' }}>
        <Title>{title}</Title>
      </Box>
    ) : null}
    <div>
      <p>
        After a week of increased rewards to celebrate the relaunch of SecretSwap LP rewards, the reward levels have
        returned to their normal levels.
      </p>

      <p>
        Thanks for participating, providing and earning. We encourage everyone to continue staking & compounding, and to
        look forward to announcements about the future of SEFI & SecretSwap
      </p>

      <p>The SecretSwap Team</p>
    </div>
  </Box>
);
