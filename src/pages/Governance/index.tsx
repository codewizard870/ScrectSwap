import React from 'react';
import { useLocation } from "react-router-dom";
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import  Theme  from '../../themes';
import { SecretSwapPairs } from 'stores/SecretSwapPairs';
import { SecretSwapPools } from 'stores/SecretSwapPools';
import './style.scss';
import { Button } from 'semantic-ui-react';
import { ProposalRow } from 'components/ProposalRow';


export const GovernancePageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  let { user, theme } = useStores();
  let query = useQuery();

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
 

  return <Governance user={user} query={query} theme={theme}/>;
});

export class Governance extends React.Component<
  {
    user: UserStoreEx;
    query: URLSearchParams;
    theme: Theme;
  },
  {
    count: string;
    filters: Array<any>;
    selectedFilter: number;
    proposals: Array<{
        index:number,
        title:string,
        endTime:Date,
        status:string,
    }>;
  }
> {

  constructor(props: { user: UserStoreEx; theme:Theme ;query:URLSearchParams}) {
    super(props);
    this.state = { 
        count:'string',
        filters:['All','Active',"Passed","Failed"],
        selectedFilter:0,
        proposals:[
          {
            index:1,
            title:'Awareness Committee Funding',
            endTime:this.randomDate(new Date(2012, 0, 1), new Date()),
            status:'failed',
          },
          {
              index:2,
              title:'Awareness Committee Funding',
              endTime:this.randomDate(new Date(2012, 0, 1), new Date()),
              status:'active',
          },
          {
            index:3,
            title:'Awareness Committee Funding',
            endTime:this.randomDate(new Date(2012, 0, 1), new Date()),
            status:'passed',
          },
        ]
    };
  }  
  setFilter(i:number):void{
    this.setState({
        selectedFilter:i
    })
  }
  //Temp function
  randomDate(start, end) {
    return new Date(start. getTime() + Math. random() * (end. getTime() - start. getTime()));
  }
  render() {

    return (
      <BaseContainer>
        <PageContainer>
          <Box
            className={`${this.props.theme.currentTheme}`}
            pad={{ horizontal: '136px', top: 'small' }}
            style={{ alignItems: 'center' }}
          > 
          {/* <div className='governance '> */}
            <div className='hero-governance'>
                <div className='column'>
                    <div>
                        <h1>12.8%</h1>
                        <p>Staking APY</p>
                    </div>
                    <div>
                        <h1>5,200 <span className='pink'>SEFI</span> <span>(7%)</span></h1>
                        <p>My Voting Power</p>
                    </div>
                    <div>
                        <h1>74,285.71 <span className='pink'>SEFI</span></h1>
                        <p>Total Voting Power</p>
                    </div>
                </div>
                <div className='buttons'>
                        <Button className='g-button'>Participate in Governance</Button>
                        <Button className='g-button--outline'>Create proposal</Button>
                </div>
            </div>
            <div className='content-governance'>
                <div className='column content-governance__title'>
                    <h3>Active Proposal</h3>
                    <div className='filters'>
                        {
                            this.state.filters.map((filter,i)=>{
                                return(
                                    <Button 
                                    key={`${i}${filter}`}
                                        onClick={()=>{ this.setFilter(i)}}
                                        className={
                                            (i == this.state.selectedFilter)? 'active filter-button': 'filter-button'
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
                            this.state.proposals.map(p=>{
                                return <ProposalRow key={p.index} theme={this.props.theme} index={p.index} title={p.title} endTime={p.endTime} status={p.status}></ProposalRow>
                            })
                        }
                </div>
            </div>     
          {/* </div> */}
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }
}
