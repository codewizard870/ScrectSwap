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
      <p>We are pleased to announce Earn contracts are live!</p>

      <p>
        In order to allow everyone time to migrate without being pressured, we are allow a period of 48 hours before
        rewards are enabled.
      </p>

      <p>
        To celebrate the relaunch of LP rewards SEFI will be distributed at an accelerated rate for the first week! Stay
        tuned to find out more about this.
      </p>

      <p>
        If you want to enjoy these new rewards and you haven't done so already, you may use the "migration" button
        attached to each pool. This tool will automatically unstake from the old pool, and restake your LP tokens in the
        new pool!
      </p>

      <p>Happy Earning!</p>
      <p>The SecretSwap Team</p>
    </div>
  </Box>
);
