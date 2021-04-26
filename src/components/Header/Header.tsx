import React,{ useEffect, useState} from 'react';
import {Link} from 'react-router-dom'
import { Redirect, useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import {SefiModal} from '../SefiModal';
import  "./header.scss";
import { getNativeBalance, wrongViewingKey } from './utils';
import { BigNumber } from 'bignumber.js';
import { displayHumanizedBalance, fixUnlockToken, humanizeBalance, unlockToken } from 'utils';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from 'pages/TokenModal/types/SwapToken';
import { ITokenInfo } from 'stores/interfaces';
// Import Icons
const Header = (props) =>{
    const history = useHistory(); 
    const { user, tokens,userMetamask,theme } = useStores();
    const isSwap = history.location.pathname === '/swap';
    const isPool = history.location.pathname === '/pool';
    const isSeFi = history.location.pathname === '/sefi';
    const [balance,setBalance] = useState('0.0');
    
    async function getBalanceSRCT() {
        const balanceSCRT  = await getNativeBalance(user.address, user.secretjsSend); 
        const _balance = displayHumanizedBalance(
            humanizeBalance(new BigNumber(balanceSCRT as BigNumber), 6),
            BigNumber.ROUND_DOWN,
        ) 
        return _balance;
    };
    function displayBalanceSRCT(){
        getBalanceSRCT().then((res)=>{
            setBalance(res)
        })
    }

    const handleSignIn = async()=>{
        if(user.isKeplrWallet){
            user.signIn();
        }
    }

    const getAddress = ():string=>{
        if(user.address){
            return (user?.address?.substring(0,7) +'...' + user?.address?.substring(user?.address?.length - 3,user?.address?.length));
        }else{
            return '';
        }
    }
    function switchTheme(){  
        theme.switchTheme();
        props.forceUpdate();
        // window.location.reload();
    }

    displayBalanceSRCT();

    return(
        <>
            <div className={theme.currentTheme}>
                    <nav className={`menu`} > 
                    <div className="menu-left">
                        <img src='/static/secret-swap.svg' alt="brand logo"/>

                        <ul className='nav_menu__items'>
                            <li className={(isSwap) ? 'active':''}><Link  to={"/swap"}>Swap</Link></li>
                            <li><span>|</span></li>
                            <li  className={(isPool)  ? 'active':''}><Link  to={"/pool"}>Pool</Link></li>
                            <li><span>|</span></li>
                            <li  className={(isSeFi) ? 'active':''}><Link  to="/sefi">Earn</Link></li>
                            {/* <li><span>|</span></li> */}
                            {/* <li><Link  to="/">Governance</Link></li>  */}
                        </ul>
                    </div>
                    
                    <div className="menu-right">
                        
                        <SefiModal
                            tokens={tokens}
                            user={user}
                            metaMask={userMetamask}
                        />
                        <div className="btn-main">
                            <div className="wallet-icon">
                                <img src="/static/wallet-icon.svg" alt="wallet icon"/>
                            </div>
                            <p>{getAddress()}</p>
                            <span>|</span>
                            <div>
                                <p className="balance">{balance}</p>
                                <p>SCRT</p>
                            </div>
                        </div>
                    <div className="kpl_images__container">
                        <img onClick={handleSignIn} src='/static/keplricon.svg' alt="Key Icon"/>
                    </div>
                        <div className="theme__container">
                            {(theme.currentTheme == 'light')?
                                <img onClick={switchTheme} src='/static/moon.svg' alt="Key Icon"/>:
                                <img onClick={switchTheme} src='/static/sun.svg' alt="Key Icon"/>
                            
                            }
                        </div>
                    </div>

                </nav> 
            </div>
        </>
    )

}

export default Header;