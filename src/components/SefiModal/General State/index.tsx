import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
const GeneralState = (props:{
  data:SefiData
})=>{
  return(
    <>
       <div className="sefi-grid__container background_free claim-sefi__container">
          <div className="align-center">
            {
              (props.data.balance > 0) && <button className="sefi-claim__button">Claim Sefi</button>
            }
          </div>
          <div className="item right sefi-balance">
            <div><img src="/static/scrt.svg" alt=""/></div>
            <span>SEFI</span>
            <h1>{props.data.balance}</h1>
          </div>
        </div>
        <div className="sefi-grid__container">
          <span className='item left'>Balance</span>
          <strong className='item right'>{props.data.balance} </strong>
          <span className='item left'>Unclaimed
            <Popup trigger={<Icon
              className="icon_info"
              name="info"
              circular
              size="tiny"/>}
          />
          </span>
          <strong className='item right'> {props.data.unclaimed} </strong>
        </div>
        <div className="sefi-grid__container">
          <span className='item left'>SEFI price</span>
          <strong className='item right'> {props.data.sefi_price}</strong>
          <span className='item left'>SEFI in circulation </span>
          <strong className='item right'> {props.data.sefi_in_circulation} </strong>
          <span className='item left'>Total Supply </span>
          <strong className='item right'> {props.data.total_supply} </strong>
        </div>
        <div className="sefi-grid__container links background_free">
              <strong className='item left'><a>View Analytics</a></strong>
              <strong className='item right primary'><a>Create viewing keys</a></strong>
        </div>
    </>
  )
}

export default GeneralState;