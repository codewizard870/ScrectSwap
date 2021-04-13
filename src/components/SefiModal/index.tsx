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
import { displayHumanizedBalance, fixUnlockToken, humanizeBalance, unlockToken } from 'utils';
import { getNativeBalance, unlockJsx, wrongViewingKey } from './utils';
import axios from 'axios'

export const SefiModal = (props: {
  user: UserStoreEx; 
  trigger: any;
  tokens: Tokens;
  // notify?: CallableFunction;
})=>{
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<SefiModalState>(SefiModalState.GENERAL);
  const [data ,setData] = React.useState<SefiData>({
    balance:0.0,
    unclaimed:7.0000,
    sefi_price: 2.89,
    sefi_in_circulation : '48,896,241',
    total_supply: '1bn'
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

  async function getSefiBalance(){
    const token :SwapToken  = await getSefiToken();
    let balance = await refreshTokenBalance(token);
    const humanizedBalance = displayHumanizedBalance(
      humanizeBalance(new BigNumber(balance as BigNumber), token.decimals),
      BigNumber.ROUND_DOWN,)

    return humanizedBalance
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
        balance = unlockJsx({
          onClick: async () => {
            await props.user.keplrWallet.suggestToken(props.user.chainId, tokenAddress);
            // TODO trigger balance refresh if this was an "advanced set" that didn't
            // result in an on-chain transaction
          },
        });
        userBalancePromise = balance;
      } else if (balance === fixUnlockToken) {
        userBalancePromise = wrongViewingKey;
      } else {
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
  function getData():any {
    getSefiBalance().then(async(balance)=>{
      const price = await getSefiPrice()
      setData({
        ...data,
        balance:parseFloat(balance),
        sefi_price:price,
      })
    }) 
  }
  const onClaimSefi = ()=>{
    console.log("Moving to Claim");
    setStatus(SefiModalState.CLAIM);
  };

  const onClaim = ()=>{
    console.log('Claiming SEFI...')
    setStatus(SefiModalState.CONFIRMATION);
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
      trigger={props.trigger}
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
        {(status === SefiModalState.GENERAL) && <General onClaimSefi={onClaimSefi} data={data}/>}
        {(status === SefiModalState.CLAIM) && <Claim onClaim={onClaim} data={data}/>}
        {(status === SefiModalState.CLAIM_CASH_BACK) && <ClaimCashback data={data}/>}
        {(status === SefiModalState.LOADING) && <Loading data={data}/>}
        {(status === SefiModalState.CONFIRMATION) && <Confirmation data={data}/>}
        {(status === SefiModalState.CONFIRMATION_CASHBACK) && <ConfirmationCashback data={data}/>}
       
      </Modal.Content>
    </Modal>
  )
}