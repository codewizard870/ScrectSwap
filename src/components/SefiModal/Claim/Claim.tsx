import React from 'react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { divDecimals } from 'utils';
import { CopyWithFeedback } from 'components/Swap/CopyWithFeedback';
import { useStores } from 'stores';
import Wallet , {WalletType} from '../components/WalletContainer'
const Claim = (props:{
  data:SefiData,
  claimInfo:any,
  onClaimErc:Function,
  onClaimSCRT:Function,
  onMetaMaskIcon:Function,
  onKeplrIcon:Function,
})=>{
  const scrtBalance = parseFloat(divDecimals(props.claimInfo.scrt?.amount?.toString(), 6));
  const ethBalance = parseFloat(divDecimals(props.claimInfo.eth?.amount?.toString(), 6));
  const {theme} =useStores();
  return(
    <>
      <Wallet
        address={props.claimInfo?.scrt?.address}
        type={WalletType.Keplr} 
        ConnectWallet={props.onKeplrIcon}
        />
      <Wallet
        address={props.claimInfo?.eth?.address}
        type={WalletType.Metamask} 
        ConnectWallet={props.onMetaMaskIcon}
        />
      <div className="displayed-center">
        <div className="displayed-center__item">
          <img src="/static/token-images/sefi.svg" alt="scrt"/>
        </div>
        <p className="displayed-center__item">You earned</p>
        <div className="displayed-center__item claiming_section">
          <div className="claim-srct">
            <img src="/static/tokens/scrt.svg" alt=""/>
            <h4 style={{margin: '.5rem 0'}}>
              {
                (isNaN(scrtBalance)
                  ?"0"
                  :scrtBalance)
              } SEFI</h4>
            <button 
              disabled={isNaN(scrtBalance) || props.claimInfo?.scrt?.isClaimed || scrtBalance == 0}  
              onClick={()=>{props.onClaimSCRT()}} 
              className="claim-button"> 
                {(isNaN(scrtBalance) || props.claimInfo?.scrt?.isClaimed || scrtBalance == 0)?'Previously Claimed':'Claim SEFI'}
            </button>
          </div>
          <div className="claim-eth">
            <img src="/static/eth.png" alt=""/>
            <h4 style={{margin: '.5rem 0'}} >{(isNaN(ethBalance)?"0":ethBalance)} SEFI</h4>
            <button 
              disabled={isNaN(ethBalance) || props.claimInfo?.eth?.isClaimed || ethBalance == 0} 
              onClick={()=>{props.onClaimErc()}} 
              className="claim-button">
                {(isNaN(ethBalance) || props.claimInfo?.eth?.isClaimed || ethBalance == 0)?'Previously Claimed':'Claim SEFI'}
            </button>
          </div>

        </div>
        <span className="displayed-center__item">Claim your SEFI to participate in governance and yield opportunities</span>
        <a className={`displayed-center__item ${theme.currentTheme}`} href="https://www.secretswap.io/faq">Read more about SEFI</a>
        
      </div>
    </>
  )
}

export default Claim;
