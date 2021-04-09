import React from 'react';
import { Modal } from 'semantic-ui-react'; 
import { GetSnip20Params, Snip20TokenInfo } from '../../blockchain-bridge';
import { CosmWasmClient } from 'secretjs';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import Loader from 'react-loader-spinner'; 
import { ExitIcon } from '../../ui/Icons/ExitIcon'; 
import cn from 'classnames';
import {SefiModalState} from './types/SefiModalState';
import {SefiData} from './types/SefiData';
import General from './General State';
import  './styles.scss';
import { BigNumber } from 'bignumber.js';

export const SefiModal = (props: {
  // secretjs: CosmWasmClient; 
  trigger: any;
  // onClick?: any;
  // notify?: CallableFunction;
})=>{
  const [open, setOpen] = React.useState(true);
  const [status, setStatus] = React.useState<SefiModalState>(SefiModalState.GENERAL);
  const [data ,setData] = React.useState<SefiData>({
    balance:0,
    unclaimed:7.0000,
    sefi_price: 2.89,
    sefi_in_circulation : '48,896,241',
    total_supply: '1bn'
  });
  setTimeout(() => {
    setData({
      ...data,
      balance:200
    })
  }, 1000);
  return(
    <Modal
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={props.trigger}
      className="sefi-modal"
    >
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Your SEFI Breakdown</span>
          <span style={{ cursor: 'pointer' }} onClick={() => setOpen(false)}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        {
          (status === SefiModalState.GENERAL) && <General data={data}/>
          
        }
       
      </Modal.Content>
    </Modal>
  )
}