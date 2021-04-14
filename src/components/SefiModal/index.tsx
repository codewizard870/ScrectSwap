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
import { displayHumanizedBalance, divDecimals, fixUnlockToken, humanizeBalance, sleep, unlockToken } from 'utils';
import { getNativeBalance, unlockJsx, wrongViewingKey } from './utils';
import axios from 'axios'
import { claimErc, claimInfoErc, ClaimInfoResponse, claimInfoScrt, claimScrt } from './utils_claim';
import { notify } from 'pages/Earn';
import { User } from 'components/Base/components/Icons/tsx_svg_icons';

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
    unclaimed:'',
    sefi_price: 0.0,
    sefi_in_circulation : '',
    total_supply: ''
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
  async function getTotalSupply(SefiAddress : string) {
    try {
      const result = await GetSnip20Params({
        address: SefiAddress,
        secretjs: props.user.secretjs,
      });
      console.log(result)
      return result?.total_supply || '0';
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

  function getData():any {
    getSefiToken().then(async(token : SwapToken)=>{
      const balance = await getSefiBalance(token);
      const price = await getSefiPrice()
      const claimInfo = await getClaimInfo();
      const totalSupply = await getTotalSupply(token.address);

      setData({
        ...data,
        balance:parseFloat(balance),
        sefi_price:price,
        unclaimed: divDecimals(claimInfo?.amount.toString() || '0', 6),
        total_supply: totalSupply,
        sefi_in_circulation: totalSupply,
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
      console.log(result);
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