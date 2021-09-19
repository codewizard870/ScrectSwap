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
        Due to a smart contract vulnerability that has since been fixed, earn pools are not currently generating
        rewards. New pools will be released soon which will allow you to migrate and continue to earn rewards as normal.
      </p>

      <p>
        Unfortunately, due to the nature of the vulnerability, unclaimed rewards are no longer available. This an
        unavoidable consequence of the vulnerability and the need to fix it before restoring service to SecretSwap.
      </p>

      <p>
        We are still examining ways to restore unclaimed rewards, but doing so is a non-trivial issue that should not
        delay the relaunch of SecretSwap. Stay tuned for more updates on the new LP staking rewards, and restoration of
        other core network services such as the Secret Bridge
      </p>

      <ul>
        <li>
          To withdraw rewards from the pool, use the "withdraw" button for each pool. This will automatically withdraw
          all your rewards. You do not need a viewing key to use this feature
        </li>
        <li>
          We recommend backing up your viewing keys for the earn pools. These may be used in the future to validate
          earned SEFI rewards
        </li>
        <li>
          Known issues:
          <ul>
            <li>Withdraw message will return a 0.0000 for the amount of lp tokens withdrawn regardless of amount</li>
            <li>Creating a viewing key for disabled earn contracts may fail</li>
          </ul>
        </li>
      </ul>
    </div>
  </Box>
);
