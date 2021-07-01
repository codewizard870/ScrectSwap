import React, { useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Box } from 'grommet';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { observer } from 'mobx-react';
import { Button } from 'semantic-ui-react';
import { ProposalRow } from 'components/ProposalRow';
import numeral from 'numeral';
import './style.scss';
import { apyString, RewardsToken } from 'components/Earn/EarnRow';
import { unlockJsx } from 'pages/Swap/utils';
import { unlockToken } from 'utils';
import { rewardsDepositKey } from 'stores/UserStore';


export const Governance = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  let { user, theme,tokens } = useStores();
  let query = new URLSearchParams(useLocation().search);
  const [rewardToken,setRewardToken] = React.useState<RewardsToken>(undefined);
  const [totalLocked,setTotalLocked] = React.useState(0.0);
  const [votingPower,setVotingPower] = React.useState(undefined);
  const [state, setState]= React.useState({ 
    count:'string',
    filters:['All','Active',"Passed","Failed"],
    selectedFilter:0,
    proposals:[
      {
        index:1,
        title:'Awareness Committee Funding',
        endTime:randomDate(new Date(2012, 0, 1), new Date()),
        status:'failed',
      },
      {
          index:2,
          title:'Awareness Committee Funding',
          endTime:randomDate(new Date(2012, 0, 1), new Date()),
          status:'active',
      },
      {
        index:3,
        title:'Awareness Committee Funding',
        endTime:randomDate(new Date(2012, 0, 1), new Date()),
        status:'passed',
      },
      {
        index:4,
        title:'Awareness Committee Funding',
        endTime:randomDate(new Date(2012, 0, 1), new Date()),
        status:'failed',
      },
      {
          index:5,
          title:'Awareness Committee Funding',
          endTime:randomDate(new Date(2012, 0, 1), new Date()),
          status:'active',
      },
      {
        index:6,
        title:'Awareness Committee Funding',
        endTime:randomDate(new Date(2012, 0, 1), new Date()),
        status:'passed',
      },
    ]
});
  
  function setFilter(i:number):void{
    setState({
      ...state,
        selectedFilter:i
    })
  }
  
  //Temp function
  function randomDate(start, end) {
    return new Date(start. getTime() + Math. random() * (end. getTime() - start. getTime()));
  }
  async function createSefiViewingKey() {
    try {
      await user.keplrWallet.suggestToken(user.chainId, rewardToken.rewardsContract);
      await user.updateScrtBalance();
      await user.updateBalanceForSymbol('SEFI');
    } catch (e) {
      console.error("Error at creating new viewing key ",e)
    }
    
  }

  //fetch total locked and Staking APY
  useEffect(()=>{
    (async () => {
        const sefi_reward_token = await user.getRewardToken('SEFI')
        const {total_locked} = await user?.secretjs?.queryContractSmart(process.env.SEFI_STAKING_CONTRACT,{"total_locked":{}})
        const totalLocked = total_locked?.amount;

        setRewardToken(sefi_reward_token)
        setTotalLocked(totalLocked)
        
    })();
    
  },[tokens.allData])

  //update voting power
  useEffect(()=>{
    (async (a) => {
      if(a){
          await user.updateBalanceForSymbol(a.display_props.symbol);
          await user.refreshRewardsBalances(a.display_props.symbol);
          setVotingPower(user.balanceRewards[rewardsDepositKey(a.display_props.symbol)]);
        }
        
    })(rewardToken);
    
  },[rewardToken])


  return (
    <BaseContainer>
      <PageContainer>
        <Box
          className={`${theme.currentTheme}`}
          pad={{ horizontal: '136px', top: 'small' }}
          style={{ alignItems: 'center' }}
        > 
        {/* <div className='governance '> */}
          <div className='hero-governance'>
              <div className='column'>
                  <div>
                      {(rewardToken)?<h1>{apyString(rewardToken)}</h1>:<></>}
                      <p>Staking APY</p>
                  </div>
                  <div>
                      {
                        (votingPower)
                         && (votingPower?.includes(unlockToken) || !votingPower)
                              ? unlockJsx({onClick:createSefiViewingKey})
                              : <h1>{numeral(votingPower).format('0,0.00')} 
                                  <span className='pink'>SEFI</span> 
                                  <span>({numeral((votingPower*100)/totalLocked).format('0.00000%')})</span>
                                </h1>
                      }
                      
                      <p>My Voting Power</p>
                  </div>
                  <div>
                      <h1>{numeral(totalLocked).format('0,0.00')} <span className='pink'>SEFI</span></h1>
                      <p>Total Voting Power</p>
                  </div>
              </div>
              <div className='buttons'>
                <div className='buttons-container'>
                      <Button disabled={votingPower === 0 || isNaN(parseFloat(votingPower))} className='g-button'>
                        <Link to='/sefistaking'>Participate in Governance</Link>
                      </Button>
                      <Button className='g-button--outline'>
                        <Link to='/proposal'>Create proposal</Link>
                      </Button>
                </div>
              </div>
          </div>
          <div className='content-governance'>
              <div className='column content-governance__title'>
                  <h3>Active Proposal</h3>
                  <div className='filters'>
                      {
                          state?.filters.map((filter,i)=>{
                              return(
                                  <Button 
                                  key={`${i}${filter}`}
                                      onClick={()=>{ setFilter(i)}}
                                      className={
                                          (i == state?.selectedFilter)? 'active filter-button': 'filter-button'
                                      }
                                  >
                                      {filter}
                                  </Button>
                              )
                          })
                      }
                  </div>
              </div>
              <div className='list-proposal'>
                      {
                          state?.proposals.map(p=>{
                              return <ProposalRow key={p.index} theme={theme} index={p.index} title={p.title} endTime={p.endTime} status={p.status}></ProposalRow>
                          })
                      }
              </div>
          </div>     
        {/* </div> */}
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});

// export class Governance extends React.Component<
//   {
//     user: UserStoreEx;
//     query: URLSearchParams;
//     theme: Theme;
//   },
//   {
//     count: string;
//     filters: Array<any>;
//     selectedFilter: number;
//     proposals: Array<{
//         index:number,
//         title:string,
//         endTime:Date,
//         status:string,
//     }>;
//   }
// > {

//   constructor(props: { user: UserStoreEx; theme:Theme ;query:URLSearchParams}) {
//     super(props);
//     this.state = ;
//   }  
  
//   render() {

    
//   }
// }
