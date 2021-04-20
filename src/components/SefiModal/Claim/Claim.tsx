import React from 'react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { divDecimals } from 'utils';
import { CopyWithFeedback } from 'components/Swap/CopyWithFeedback';

const Claim = (props:{
  data:SefiData,
  claimInfo:any,
  onClaimErc:Function,
  onClaimSCRT:Function,
  onMetaMaskIcon:Function,
  onKeplrIcon:Function,
})=>{
  const scrtAddress  = props.claimInfo.scrt?.address.substring(0,10)+ '...'+ props.claimInfo.scrt?.address.substring( props.claimInfo.scrt?.address?.length - 10, props.claimInfo.scrt?.address?.length)
  const ethAddress  = props.claimInfo.eth?.address.substring(0,10)+ '...'+ props.claimInfo.eth?.address.substring( props.claimInfo.eth?.address?.length - 10, props.claimInfo.eth?.address?.length)
  const scrtBalance = parseFloat(divDecimals(props.claimInfo.scrt?.amount?.toString(), 6));
  const ethBalance = parseFloat(divDecimals(props.claimInfo.eth?.amount?.toString(), 8));
  
  return(
    <>
      <div className="sefi-grid__container background_free claim-sefi__item">
        <div className="item left">
          <span>
            {scrtAddress} 
          </span>
          <span style={{margin:'0 .5rem'}}>
            <CopyWithFeedback text={props.claimInfo.scrt?.address} />
          </span>
        </div>
        <div className="item right">
          <img className="small-icon" src="/static/key.svg" alt="key"/>
          <img onClick={()=>{props.onKeplrIcon()}} className="small-icon" src="/static/keplr.svg" alt="keplr"/>
        </div>
      </div>
      <div className="sefi-grid__container background_free claim-sefi__item">
        <div className="item left">
          <img src="/static/address-icon.svg" alt="" />
          <span>{ethAddress}</span>
          <span style={{margin:'0 .5rem'}}>
              <CopyWithFeedback text={props.claimInfo.scrt?.address} />
          </span>
        </div>
        <div className="item right">
          <img onClick={()=>{props.onMetaMaskIcon()}} className="small-icon" src="/static/meta-mask.svg" alt="keplr"/>
        </div>
      </div>
      <div className="displayed-center">
        <div className="displayed-center__item">
          <img src="/static/tokens/sefi.png" alt="scrt"/>
        </div>
        <p className="displayed-center__item">You earned</p>
        <div className="displayed-center__item claiming_section">
          <div className="claim-srct">
            <h4>{scrtBalance} SEFI</h4>
            <button disabled={scrtBalance == 0} onClick={()=>{props.onClaimSCRT()}} className="claim-button"> Claim SEFI in SCRT</button>
          </div>
          <div className="claim-eth">
            <h4 >{ethBalance} SEFI</h4>
            <button disabled={ethBalance == 0} onClick={()=>{props.onClaimErc()}} className="claim-button"> Claim SEFI in ETH</button>
          </div>

        </div>
        <span className="displayed-center__item">Claim your SEFI to participate in governance and yield opportunities</span>
        <a className="displayed-center__item" href="#">Read more about SEFI</a>
        
      </div>
    </>
  )
}

export default Claim;