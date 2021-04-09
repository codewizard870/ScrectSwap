import React from 'react';
import {Link} from 'react-router-dom'
import { Redirect, useHistory } from 'react-router';
import { observer } from 'mobx-react-lite';
import { useStores } from '../../stores';
import  "./header.scss";
// Import Icons
const Header = () =>{
    const history = useHistory();

    const isSwap = history.location.pathname === '/swap';
    const isPool = history.location.pathname === '/pool';
    const isSeFi = history.location.pathname === '/sefi';
    const { user } = useStores();
    
    const handleSignIn = ()=>{
        if(user.isKeplrWallet){
            user.signIn();
        }
    }
    return(
        <>
            <nav className="menu"> 
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
                    
                    <button className="btn-main">
                        <a href="#">324 SCRT</a>
                    </button>
                    <button className="btn-secondary">
                        <a href="#">324 SEFI</a>
                    </button>
                <div className="kpl_images__container">
                    <img  src='/static/key.svg' alt="Keplr Icon"/>
                    <img onClick={handleSignIn} src='/static/keplricon.svg' alt="Key Icon"/>
                </div>
                </div>

            </nav>


        </>
    )

}

export default Header;