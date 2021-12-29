import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { useEffect } from 'react';
import { InfoEarn } from './InfoEarn';
import { useHistory } from 'react-router-dom';

export const InfoModalEarn = observer(() => {
  const { user, actionModals } = useStores();
  const history = useHistory();

  useEffect(() => {
    if (history.location.pathname !== '/earn') {
      return;
    }

    if (!user.isInfoEarnReading) {
      actionModals.open(() => <InfoEarn title="Bonus rewards have ended!" />, {
        title: '',
        applyText: 'Got it',
        closeText: '',
        noValidation: true,
        showOther: true,
        onApply: () => {
          user.setInfoEarnReading();
          return Promise.resolve();
        },
      });
    }
    //eslint-disable-next-line
  }, [user.isInfoEarnReading]);

  return <></>;
});
