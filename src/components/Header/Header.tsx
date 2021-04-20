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
const Header = () =>{
    const history = useHistory(); 
    const { user, tokens,userMetamask } = useStores();
    const [theme,setTheme] = useState<String>(undefined);
    const [hasViewingKey, setHasViewingKey] = React.useState<Boolean>(true);
    const [sefi,setSefi] = useState(undefined);
    const isSwap = history.location.pathname === '/swap';
    const isPool = history.location.pathname === '/pool';
    const isSeFi = history.location.pathname === '/sefi';
    let address_formated;
    if(user.address){
        address_formated = (user?.address?.substring(0,7) +'...' + user?.address?.substring(user?.address?.length - 3,user?.address?.length));
    }else{
        address_formated = '';
    }
    const [balance,setBalance] = useState('0.0');

    async function getSefiToken(){
        const _tokens: ITokenInfo[] = [...(await tokens.tokensUsage('SWAP'))];
        // convert to token map for swap
        const swapTokens: SwapTokenMap = TokenMapfromITokenInfo(_tokens); // [...TokenMapfromITokenInfo(tokens), ...loadTokensFromList('secret-2')];
        
        let SEFItoken;
        swapTokens.forEach((st)=>{
        if(st.symbol === 'SEFI'){
            SEFItoken = st;
        }
        })
        return SEFItoken;
    };

    async function getSefiBalance(token : SwapToken){
        let balance = await refreshTokenBalance(token);
        if(JSON.stringify(balance).includes('View')){
        return balance
        }else{
        const humanizedBalance = displayHumanizedBalance(
            humanizeBalance(new BigNumber(balance as BigNumber), token.decimals),
            BigNumber.ROUND_DOWN,)
        return humanizedBalance;
        }
    };
    async function refreshTokenBalance(token: SwapToken) {
        let userBalancePromise; //balance.includes(unlockToken)
        if (token.identifier.toLowerCase() !== 'uscrt') {
        // todo: move this inside getTokenBalance?
        const tokenAddress = token?.address;

        if (!tokenAddress) {
            console.log('refreshTokenBalance: Cannot find token address for symbol', token.symbol);
            return {};
        }

        let balance = await user.getSnip20Balance(tokenAddress);

        if (balance === unlockToken) {
            setHasViewingKey(false);

        } else if (balance === fixUnlockToken) {
            userBalancePromise = wrongViewingKey;
        } else {
            setHasViewingKey(true)
            userBalancePromise = new BigNumber(balance);
        }
        } else {
        userBalancePromise = await getNativeBalance(user.address, user.secretjsSend);
        }

        return userBalancePromise ;
    }

    const handleSignIn = async()=>{
        if(user.isKeplrWallet){
            user.signIn();
        }
    }
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
    displayBalanceSRCT();
    const updateTheme = (theme)=>{
        if(theme){
            localStorage.setItem('currentTheme',theme);
            setTheme(theme)
        }else{
            throw new Error('Theme undefined does not exist')
        }
    }
    useEffect(() => {
        const local_theme = localStorage.getItem('currentTheme');
        if(!local_theme){
            updateTheme('light')
        }
    },[])
    
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
                     
                    <SefiModal
                        tokens={tokens}
                        user={user}
                        metaMask={userMetamask}
                    />
                    <div className="btn-main">
                        <div className="wallet-icon">
                            <img src="/static/wallet-icon.svg" alt="wallet icon"/>
                        </div>
                        <p>{address_formated}</p>
                        <span>|</span>
                        <div>
                            <p className="balance">{balance}</p>
                            <p>SCRT</p>
                        </div>
                    </div>
                <div className="kpl_images__container">
                    <img onClick={handleSignIn} src='/static/keplricon.svg' alt="Key Icon"/>
                </div>
                </div>

            </nav>


        </>
    )

}

export default Header;