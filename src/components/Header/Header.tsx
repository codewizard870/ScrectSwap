import React from 'react';
import  "./header.scss";
// Import Icons
import SecretSwap from '../../../public/static/secret-swap.svg';
import KeplrIcon from '../../../public/static/keplricon.svg';
import Key from '../../../public/static/key.png';

const Header = () =>{

    return(
        <>
            <nav className="menu">

                <div className="menu-left">
                    <ul>
                        {/* Brand Icon */}
                        <img src={SecretSwap} alt="brand logo"/>
                        <li><a href={"/swap"}>Swap</a></li>
                        <li><a href={"/pool"}>Pool</a></li>
                        <li><a href="#">Earn</a></li>
                        <li><a href="#">Governance</a></li>
                    </ul>
                </div>
                
                <div className="menu-right">
                    
                    <button className="btn-main">
                        <a href="#">324 SCRT</a>
                    </button>
                    <button className="btn-secondary">
                        <a href="#">324 SEFI</a>
                    </button>
                
                    <img src={Key} alt="Key Icon"/>
                    <img src={KeplrIcon} alt="Keplr Icon"/>
                    
                </div>

            </nav>


        </>
    )

}

export default Header;