import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Box } from 'grommet';
import moment from 'moment';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { observer } from 'mobx-react';
import { Button, Container } from 'semantic-ui-react';
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';
import './style.scss';

export const Migration = observer(() => {
  let { theme } = useStores();

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={`migration ${theme.currentTheme}`}
          pad={{ horizontal: '136px', top: 'small' }}
        >
          <div className="steps steps--top">

            <div className="steps__instructions">

              <h1>Migrate Your Tokens</h1>

              <p>SecretSwap SEFI Staking pool has been upgraded.<br/>Please follow
              the steps below to migrate your tokens and continue to earn rewards.</p>

            </div>

            <div>&nbsp;</div>

            <div className="steps__pool">
              <div>
                <img src="/static/sefi.png" alt="sefi logo" />
                <span>SEFI Staking</span>
              </div>
            </div>

          </div>

          <div className="steps">

            <div className={`box ${theme.currentTheme}`}>
              <h2>Step 1</h2>
              <h4>Withdraw tokens from expired pools</h4>
              <Button className="g-button">Withdraw</Button>
            </div>

            <img src="/static/arrow-right.svg" alt="arrow right icon" />

            <div className={`box ${theme.currentTheme}`}>
              <h2>Step 2</h2>
              <h4>Earn rewards in new pools</h4>
              <Button className="g-button">Earn</Button>
            </div>

          </div>

        </Box>
      </PageContainer>
    </BaseContainer >
  );
});
