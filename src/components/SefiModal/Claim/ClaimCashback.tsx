import React from 'react';
import { Popup ,Icon} from 'semantic-ui-react';
import {SefiData} from '../types/SefiData' 
import '../styles.scss';
import { useStores } from 'stores';
import Wallet, { WalletType } from '../components/WalletContainer';
const Claim = (props:{
  data:SefiData
  claimInfo:any
  onKeplrIcon:Function
  burnCashback:Function
})=>{
  const {theme} = useStores();
  return(
    <>
      <Wallet
        address={props.claimInfo?.scrt?.address}
        type={WalletType.Keplr} 
        ConnectWallet={props.onKeplrIcon}
        />
      <div className="displayed-center">
        <div className="displayed-center__item">
          <img src="/static/scrt.svg" alt="scrt"/>
        </div>
        <p className="displayed-center__item">You can burn <strong>{props.data.cashback_balance} cashback</strong> tokens to claim</p>
        <h1 className="displayed-center__item">400 SEFI</h1>
        <span className="displayed-center__item">The more you trade, the more cashback tokens you get.</span>
        {/* <a className={`displayed-center__item ${theme.currentTheme}`} href="#">Learn more about cashback tokens</a> */}
        <button className="displayed-center__item claim-button" onClick={()=>props.burnCashback()}> Claim</button>
      </div>
    </>
  )
}

export default Claim;