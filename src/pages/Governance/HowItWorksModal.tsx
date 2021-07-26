import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Box } from 'grommet';
import moment from 'moment';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { observer } from 'mobx-react';
import { Button, Popup, Modal } from 'semantic-ui-react';
import { ProposalRow } from 'components/ProposalRow';
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';
import numeral from 'numeral';
import './style.scss';
import { calculateAPY, RewardsToken } from 'components/Earn/EarnRow';
import { unlockJsx } from 'pages/Swap/utils';
import { unlockToken, zeroDecimalsFormatter } from 'utils';
import { rewardsDepositKey } from 'stores/UserStore';
import axios from "axios";
import { numberFormatter } from '../../utils/formatNumber'
import { validate } from 'webpack';
import { STATUS } from '../../stores/interfaces';

export const HowItWorksModal = observer(() => {
  const { theme } = useStores();
  const [open, setOpen] = useState(false);

  return (
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>How does this work?</Button>}
      dimmer={'blurring'}
      style={{ width: '700px', display: 'flex' }}
    >
      <Modal.Content>
        <img style={{ width: '100%' }} src="/static/how_it_works.png" alt="how it works infogram" />
      </Modal.Content>
      <Modal.Actions className={theme.currentTheme}>
        <Button onClick={() => setOpen(false)}>Close</Button>
      </Modal.Actions>
    </Modal>
  );
});
