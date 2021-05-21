import { CopyWithFeedback } from 'components/Swap/CopyWithFeedback'
import React from 'react'
import { useStores } from 'stores'
export enum WalletType {
  Keplr,Metamask
}
const Wallet = ({
  address,
  type ,
  ConnectWallet,
}:{
  address:string;
  type:WalletType;
  ConnectWallet:Function;
})=>{
  let walletImg,tokenIcon,address_formatted;
  const {theme} = useStores();
  if(address){
    address_formatted = address.substring(0,10)+ '...'+address.substring(address?.length - 10,address?.length)
  }else{
    address_formatted = undefined;
  }

  if(type == WalletType.Keplr){
    tokenIcon = "/static/scrt.svg"
    walletImg='/static/keplr.svg'
  }else{
    tokenIcon = "/static/address-icon.svg"
    walletImg='/static/meta-mask.svg'
  }
  return (
    <div className="sefi-grid__container background_free claim-sefi__item address_container">
        <div className="item left">
          <img src={tokenIcon} style={{margin: '0 5px'}} alt="" />
          <span className={`${theme.currentTheme}`}>
            {(address_formatted.includes("undefined"))
              ?`Connect your ${type}`
              :address_formatted
            }
          </span>
          <span className={theme.currentTheme} style={{margin:'0 .5rem'}}>
            <CopyWithFeedback text={address} />
          </span>
        </div>
        <div className="item right">
          {(type === WalletType.Keplr) && <img className="small-icon" src="/static/key.svg" alt="key"/>}
          <img onClick={()=>ConnectWallet()} className="small-icon" src={walletImg} />
        </div>
      </div>
  )
}

export default Wallet;