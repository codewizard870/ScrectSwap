import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { useStores } from 'stores';
const GeneralState = (props:{
  data:SefiData,
  onClaimSefi: CallableFunction,
  createViewingKey: any,
  hasViewingKey: Boolean
})=>{
  const {theme} = useStores();
  return(
    <>
       <div className={`sefi-grid__container background_free claim-sefi__container` }>
          <div className="align-center">
            {
              (props.data.sefi_in_circulation !== '—')&&<button  onClick={()=>{props.onClaimSefi()}} className="sefi-claim__button">Claim Sefi</button>
            }
          </div>
          <div className="item right sefi-balance">
            <div><img src="/static/tokens/sefi.png" alt=""/></div>
            <span>SEFI</span>
            <h1 className={theme.currentTheme}>{props.data.balance}</h1>
          </div>
        </div>
        <div className={`sefi-grid__container ${theme.currentTheme}`}>
          <span className='item left'>Balance</span>
          <strong className='item right'>{props.data.balance} </strong>
          <span className='item left'>Unclaimed
            <Popup 
              className="icon-info__popup" 
              position='top center'
              on='click'
              trigger={
                <Icon
                  className="icon_info"
                  name="info"
                  circular
                  size="tiny"
                />
              }
            >
              <p>When users trade, they acquire cashback tokens. These cashback tokens can be burned to claim SEFI.</p>
              <a href="#">Learn more about cashback tokens</a>
            </Popup>
          </span>
          <strong className='item right'> {props.data.unclaimed} </strong>
        </div>
        <div className={`sefi-grid__container ${theme.currentTheme}`}>
          <span className='item left'>SEFI price</span>
          <strong className='item right'> {props.data.sefi_price}</strong>
          <span className='item left'>SEFI in circulation </span>
          <strong className='item right'> {props.data.sefi_in_circulation} </strong>
          <span className='item left'>Total Supply </span>
          <strong className='item right'> {props.data.total_supply} </strong>
        </div>
        <div className="sefi-grid__container links background_free">
              <strong className='item left'><a className={`view_analytics ${theme.currentTheme}`} href="https://secretanalytics.xyz/secretswap" target='_blank'>View Analytics</a></strong>
              {
                (!props.hasViewingKey) && 
                  <strong onClick={props?.createViewingKey} className='item right primary'>
                    <a>Create viewing keys</a>
                  </strong>
              }
        </div>
    </>
  )
}

export default GeneralState;