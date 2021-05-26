import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { useStores } from 'stores';
import { divDecimals } from 'utils';
import { unlockJsx } from '../utils';
import { createViewingKey } from 'pages/Exchange/utils';
const GeneralState = (props:{
  data:SefiData,
  onClaimSefi: CallableFunction,
  onClaimCashback: CallableFunction,
  createSefiViewingKey: any,
  createCSHBKViewingKey: any,
  claimInfo:any,
  hasViewingKey: Boolean
})=>{
  const {theme} = useStores();
  const scrtBalance = parseFloat(divDecimals(props.claimInfo?.scrt?.amount?.toString(), 6));
  const ethBalance = parseFloat(divDecimals(props.claimInfo?.eth?.amount?.toString(), 6));

  return(
    <>
      <div className={`table_container ${theme.currentTheme}`}>
        <table>
            <thead>
              <tr>
                <td className='align-left'>Token</td>
                <td>Balance</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              <tr> 
                <td className='bold_titles'>SEFI</td>
                {
                  (props.data.balance != 'Unlock' && props.data.balance != '—')
                  ? <>
                      <td>
                        <strong>
                          {
                            isNaN(parseFloat(props.data.balance))
                              ? "0.0"
                              : props.data.balance
                          }
                        </strong>
                      </td>
                      <td>
                        {
                          (props.data.sefi_in_circulation !== '—')&&
                          <button  
                            disabled={(isNaN(scrtBalance) || props.claimInfo?.scrt?.isClaimed || scrtBalance == 0)&&(isNaN(ethBalance) || props.claimInfo?.eth?.isClaimed || ethBalance == 0)}
                            onClick={()=>{props.onClaimSefi()}}
                          >
                            Claim 
                          </button>
                        }
                      </td>
                    </>
                  : <td colSpan={2}>{unlockJsx({onClick:props.createSefiViewingKey})}</td>
                }
              </tr>
              <tr> 
                <td className='bold_titles'> 
                  CSHBACK 
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
                    </Popup>   
                </td>
                {
                  (props.data.cashback_balance != 'Unlock' && props.data.cashback_balance != '—')
                  ? <>
                      <td>
                        <strong>
                          {
                            isNaN(parseFloat(props.data.cashback_balance))
                              ? "0.0"
                              : props.data.cashback_balance
                          }
                        </strong>
                      </td>
                      <td>
                        {
                          (props.data.cashback_balance !== '—')&&
                          <button 
                            disabled={parseFloat(props.data.cashback_balance) == 0}
                            onClick={()=>{props.onClaimCashback()}}
                          >
                              Redeem
                          </button>

                        }
                      </td>
                    </>
                  : <td colSpan={2}>{unlockJsx({onClick:props.createCSHBKViewingKey})}</td>
                }
              </tr>
            </tbody>
        </table>
      </div>
      <div className="join_message">
        <p>Join the privacy-first, front-running resistant open finance movement!</p>
      </div>
       {/* <div className={`sefi-grid__container background_free claim-sefi__container` }>
          <div className="align-center">
            {
              (props.data.sefi_in_circulation !== '—')&&<button  onClick={()=>{props.onClaimSefi()}} className="sefi-claim__button">Claim Genesis Sefi</button>
            }
          </div>
          <div className="item right sefi-balance">
            <div><img src="/static/tokens/sefi.png" alt=""/></div>
            <span>SEFI</span>
            <h1 className={theme.currentTheme}>{(isNaN(parseFloat(props.data.balance))?"0.0":props.data.balance)}</h1>
          </div>
        </div> */}
        {/* <div className={`sefi-grid__container ${theme.currentTheme}`}>
          <span className='item left'>Balance</span>
          <strong className='item right'>{(isNaN(parseFloat(props.data.balance))?"0.0":props.data.balance)} </strong>
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
          <strong className='item right'> {(isNaN(parseFloat(props.data.unclaimed))?"0.0":props.data.unclaimed)} </strong>
        </div>
         */}
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
              {/* {
                (!props.hasViewingKey) && 
                  <strong onClick={props?.createViewingKey} className='item right primary'>
                    <a>Create viewing keys</a>
                  </strong>
              } */}
        </div>
    </>
  )
}

export default GeneralState;