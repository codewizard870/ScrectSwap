import React, { useEffect } from 'react';
import { Modal } from 'semantic-ui-react'; 
import { GetSnip20Params, Snip20TokenInfo } from '../../blockchain-bridge';
import { CosmWasmClient } from 'secretjs';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import Loader from 'react-loader-spinner'; 
import { ExitIcon } from '../../ui/Icons/ExitIcon';
import {SefiModalState} from './types/SefiModalState';
import {SefiData} from './types/SefiData';
import General from './General State';
import Claim from './Claim/Claim';
import ClaimCashback from './Claim/ClaimCashback';
import Loading from './Loading'
import Confirmation from './Confirmation/Confirmation'
import ConfirmationCashback from './Confirmation/ConfirmationCashback'
import  './styles.scss';
import { BigNumber } from 'bignumber.js';
import { ITokenInfo } from 'stores/interfaces';
import { Tokens } from 'stores/Tokens';
import { UserStoreEx } from 'stores/UserStore';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from 'pages/TokenModal/types/SwapToken';
import { displayHumanizedBalance, divDecimals, fixUnlockToken, formatWithTwoDecimals, humanizeBalance, sleep, unlockToken } from 'utils';
import { getNativeBalance, wrongViewingKey } from './utils';
import axios from 'axios'
import { claimErc, claimInfoErc, ClaimInfoResponse, claimInfoScrt, claimScrt } from './utils_claim';
import numeral from 'numeral'

export const SefiModal = (props: {
  user: UserStoreEx;
  tokens: Tokens;
  // notify?: CallableFunction;
})=>{
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<SefiModalState>(SefiModalState.GENERAL);
  const [hasViewingKey, setHasViewingKey] = React.useState<Boolean>(false);
  const [token, setToken] = React.useState<SwapToken>(undefined);
  const [data ,setData] = React.useState<SefiData>({
    balance:'—',
    unclaimed:'—',
    sefi_price: 0.0,
    sefi_in_circulation : '—',
    total_supply: '—'
  });

  async function getSefiToken(){
    const tokens: ITokenInfo[] = [...(await props.tokens.tokensUsage('SWAP'))];
    // convert to token map for swap
    const swapTokens: SwapTokenMap = TokenMapfromITokenInfo(tokens); // [...TokenMapfromITokenInfo(tokens), ...loadTokensFromList('secret-2')];
    
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
    console.log(balance)
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

      let balance = await props.user.getSnip20Balance(tokenAddress);

      if (balance === unlockToken) {
        setHasViewingKey(false);

      } else if (balance === fixUnlockToken) {
        userBalancePromise = wrongViewingKey;
      } else {
        setHasViewingKey(true)
        userBalancePromise = new BigNumber(balance);
      }
    } else {
      userBalancePromise = await getNativeBalance(props.user.address, props.user.secretjsSend);
    }

    return userBalancePromise ;
  }
  async function getSefiPrice(){
    const time = new Date().getTime();

    const statsData = await axios({
        method: 'get',
        url: 'https://storage.googleapis.com/astronaut/sefi.json?time=' + time
    });
    return parseFloat(statsData.data.price);
  }
  async function getTotalSupply(SefiAddress : string) {
    try {
      const result = await GetSnip20Params({
        address: SefiAddress,
        secretjs: props.user.secretjsSend,
      }); 
      return parseInt(result?.total_supply) / 10^result?.decimals || 0;
    } catch (error) {
      console.error(error)
      return undefined;
    }
  }
  async function getClaimInfo ():Promise<any>{
    while (!props.user.secretjs) {
      await sleep(100);
    }
    if (props.user.address) {
      claimInfoScrt(props.user.secretjs, props.user.address).then((claimInfo)=>{
        return claimInfo;
      }).catch(() => {
        return undefined;
      });
    }
  };
  async function createViewingKey() {
    try {
      setOpen(false);
      await props.user.keplrWallet.suggestToken(props.user.chainId, token.address);
      setHasViewingKey(true)
    } catch (e) {
      console.error("Error at creating new viewing key ",e)
    }
    
  }
  function getFloatFormat(number) {
    let result;
    switch (number.toFixed(0).toString().length) {
        case 1:
        case 2:
        case 4:
        case 7:
        case 10:
            result = '(0.00a)';
            break;
        case 5:
        case 8:
        case 11:
            result = '(0.0a)';
            break;
        case 3:
        case 6:
        case 9:
        default:
            result = '(0a)';
    }
    return result;
  }
  function getData():any {
    getSefiToken().then(async(token : SwapToken)=>{
      setToken(token)
      let balance = undefined;
      try {
        balance = await getSefiBalance(token);
        balance = balance.toString().replace(",","")
        balance = formatWithTwoDecimals(balance);
      } catch (error) {
        console.error("Error at getting SEFI balance")
      }
      const price = await getSefiPrice()
      const price_formatted = numeral(price).format('$0.00');
      const claimInfo = await getClaimInfo();
      const unclaimed = divDecimals(claimInfo?.amount.toString() || '0', 6);
      const totalSupply = await getTotalSupply(token.address);
      const totalSupply_formatted = numeral(totalSupply).format(getFloatFormat(totalSupply)).toString().toUpperCase()
      
      setData({
        ...data,
        balance: balance || "—",
        sefi_price:price_formatted,
        unclaimed: unclaimed,
        total_supply: totalSupply_formatted,
        sefi_in_circulation: '0.0',
      })
    });
  }
  const onClaimSefi = ()=>{
    console.log("Moving to Claim");
    setStatus(SefiModalState.CLAIM);
  };

  const onClaim = async()=>{
    console.log('Claiming SEFI...')
    try {
      const result = await claimScrt(props.user.secretjsSend, props.user.address);
      
      console.log('success', 'Claimed SeFi successfully!');
      setStatus(SefiModalState.CONFIRMATION);
    } catch (e) {
      console.error(`failed to claim ${e}`);
    } finally {
      await props.user.updateBalanceForSymbol('SEFI');
      console.log(props.user.balanceToken['SEFI'])
    }
  };
  
  return(
    <Modal
      onClose={() => { 
          setStatus(SefiModalState.GENERAL); 
          setOpen(false);
        }
      }
      onOpen={() =>{ setOpen(true);getData()}}
      open={open}
      trigger={
      <button className="btn-secondary">
        <a>SEFI</a>
      </button>}
      className="sefi-modal"
    >
      <Modal.Header>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {(status === SefiModalState.GENERAL)&& <span>Your SEFI Breakdown</span>}
          {(status === SefiModalState.CLAIM || status === SefiModalState.CLAIM_CASH_BACK)&& <span>Claim your SEFI tokens</span>}
          {(status === SefiModalState.LOADING)&& <span>Claiming</span>}
          {(status === SefiModalState.CONFIRMATION || status === SefiModalState.CONFIRMATION_CASHBACK)&& <span>Claimed SEFI</span>}
          <span style={{ cursor: 'pointer' }} onClick={() => {
            setStatus(SefiModalState.GENERAL);
            setOpen(false);
          }}>
            <ExitIcon />
          </span>
        </div>
      </Modal.Header>
      <Modal.Content>
        {(status === SefiModalState.GENERAL) && <General createViewingKey={createViewingKey} hasViewingKey={hasViewingKey} onClaimSefi={onClaimSefi} data={data}/>}
        {(status === SefiModalState.CLAIM) && <Claim onClaim={onClaim} data={data}/>}
        {(status === SefiModalState.CLAIM_CASH_BACK) && <ClaimCashback data={data}/>}
        {(status === SefiModalState.LOADING) && <Loading data={data}/>}
        {(status === SefiModalState.CONFIRMATION) && <Confirmation data={data}/>}
        {(status === SefiModalState.CONFIRMATION_CASHBACK) && <ConfirmationCashback data={data}/>}
       
      </Modal.Content>
    </Modal>
  )
}