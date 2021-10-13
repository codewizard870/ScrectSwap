import { observer } from 'mobx-react';
import React, { ReactChild, useState, useEffect } from 'react';
import { Modal } from 'semantic-ui-react';
import Theme from 'themes';
import { getAPRStats, RewardsToken, StastsAPR } from '../EarnRow';
import './style.scss';
import { ExitIcon } from 'ui/Icons/ExitIcon';
import numeral from 'numeral';

interface ModalExplanationProps {
  token: RewardsToken;
  theme: Theme;
  children?: ReactChild;
}

const ModalExplanation = observer(({ token, theme, children }: ModalExplanationProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<StastsAPR>(undefined);

  useEffect(() => {
    if (open) {
      const stats = getAPRStats(token, Number(token.rewardsPrice));
      setStats(stats);
    }
  }, [open, token]);

  return (
    <Modal
      className={`apr-modal ${theme.currentTheme}`}
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      trigger={children}
    >
      <div className="apr-modal-header">
        <h3>APY</h3>
        <ExitIcon onClick={() => setOpen(false)} />
      </div>
      <div className="apr-base">
        <p>Base APR (yield only)</p>
        <p>
          <strong>{formatRoi(stats?.apr)}</strong>
        </p>
      </div>
      <table>
        <thead>
          <tr>
            <td>Timeframe</td>
            <td>ROI</td>
            <td>SEFI per $1000</td>
          </tr>
        </thead>
        <tbody>
          {stats ? (
            Object.keys(stats?.roi).map((key, i) => (
              <tr key={key + i}>
                <td>{key}</td>
                <td>{formatRoi(stats?.roi[key])}</td>
                <td>{`${format(stats?.sefiP1000[key])} ($${format(stats?.usdP1000[key])})`}</td>
              </tr>
            ))
          ) : (
            <></>
          )}
        </tbody>
      </table>
      <div className="extra-content">
        <ul>
          <li>Calculated based on current rates.</li>
          <li>Compounding 1x daily.</li>
          <li>
            All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.
          </li>
        </ul>
      </div>
    </Modal>
  );
});

export default ModalExplanation;

const formatRoi = (n: string | number): string => {
  return numeral(n).format('0,0.00%');
};

const format = (n: string | number): string => {
  return numeral(n).format('0,0.00');
};
