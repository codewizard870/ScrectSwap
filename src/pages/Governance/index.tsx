import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Box } from 'grommet';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { observer } from 'mobx-react';
import { Button } from 'semantic-ui-react';
import { ProposalRow } from 'components/ProposalRow';
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';
import numeral from 'numeral';
import './style.scss';
import { calculateAPY, RewardsToken } from 'components/Earn/EarnRow';
import { unlockJsx } from 'pages/Swap/utils';
import { unlockToken, zeroDecimalsFormatter } from 'utils';
import { rewardsDepositKey } from 'stores/UserStore';
import axios from "axios";


export const Governance = observer(() => {

  const proposalsTest = [
    {
      index: 1,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'failed',
    },
    {
      index: 2,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'in progress',
    },
    {
      index: 3,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'passed',
    },
    {
      index: 4,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'failed',
    },
    {
      index: 5,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'in progress',
    },
    {
      index: 6,
      title: 'Awareness Committee Funding',
      endTime: randomDate(new Date(2012, 0, 1), new Date()),
      status: 'passed',
    },
  ]

  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  let { user, theme, tokens } = useStores();
  let query = new URLSearchParams(useLocation().search);
  const [rewardToken, setRewardToken] = React.useState<RewardsToken>(undefined);
  const [totalLocked, setTotalLocked] = React.useState(0.0);
  const [votingPower, setVotingPower] = React.useState(undefined);

  const filters = ['all', 'in progress', "passed", "failed"];

  const [proposals, setProposals] = useState([]);

  // console.log(filters);
  // console.log(proposals);

  const [filtered, setFiltered] = useState(proposals);

  // Get the actual filter on click button
  const [selectedFilter, setSelectedFilter] = useState('all');
  // console.log(filtered);

  // console.log(selectedFilter);

  const getProposals = async () => {
    try {
      const response = await axios.get(`${process.env.BACKEND_URL}/secret_votes`);
      const data = response.data.result;
      // console.log(data);
      const result = data.map((proposal, i) => {
        return {
          index: i + 1,
          id: proposal._id,
          address: proposal.address,
          title: proposal.title,
          description: proposal.description,
          author_address: proposal.author_addr,
          author_alias: proposal.author_alias,
          end_date: proposal.end_timestamp,
          ended: proposal.ended,
          valid: proposal.valid,
          status: proposal.status.toLowerCase(),
        }
      });
      // console.log(result);
      return result;
      // console.log('Result:', result);
    } catch (error) {
      console.log('Error Message:', error);
    }
  }

  // console.log(getProposals());

  function setFilter(filter: string): void { setSelectedFilter(filter) }

  const getProporsalsByStatus = (proposals: Array<any>, status: string) => {
    if (selectedFilter === 'all') {
      setFiltered(proposals);
      // console.log('all');
    } else {
      const filter = proposals.filter((proposal => proposal.status.includes(status)));
      setFiltered(filter);
      // console.log('filtered');
    }

  }

  const countStatus = (status: string) => {
    if (status == 'all') {
      return proposals.length;
    } else {
      return proposals.filter(e => e.status === status.trim()).length;
    }
  }


  // console.log(filtered);
  // console.log(getProporsalsByStatus('passed'));

  const apyString = (token: RewardsToken) => {
    const apy = Number(calculateAPY(token, Number(token.rewardsPrice), Number(token.price)));
    if (isNaN(apy) || 0 > apy) {
      return `∞%`;
    }
    const apyStr = zeroDecimalsFormatter.format(Number(apy));

    //Hotfix of big % number
    const apyWOCommas = apyStr.replace(/,/g, '')
    const MAX_LENGHT = 6;
    if (apyWOCommas.length > MAX_LENGHT) {
      const abrev = apyWOCommas?.substring(0, MAX_LENGHT)
      const abrevFormatted = zeroDecimalsFormatter.format(Number(abrev));
      const elevation = apyWOCommas.length - MAX_LENGHT;

      return `${abrevFormatted}e${elevation} %`;

    }
    return `${apyStr}%`;
  };


  //Temp function
  function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  async function createSefiViewingKey() {
    try {
      await user.keplrWallet.suggestToken(user.chainId, rewardToken.lockedAssetAddress);
      await user.updateScrtBalance();
      await user.updateBalanceForSymbol('SEFI');
    } catch (e) {
      console.error("Error at creating new viewing key ", e)
    }
  }
  // console.log('Voting Power:', votingPower);
  // console.log('Total Voting Power: ', totalLocked);
  // console.log('Reward Token:', rewardToken);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const formatNumber = (num) => {
    if (num > 999 && num < 1000000) {
      return `${(num / 1000).toFixed(1)} ${'K'}`; // convert to K for number from > 1000 < 1 million
    } else if (num > 1000000) {
      return `${(num / 1000000).toFixed(1)} ${'M'}`; // convert to M for number from > 1 million
    } else if (num < 900) {
      return num; // if value < 1000, nothing to do
    }
  }

  useEffect(() => {
    (async () => {
      const result = await getProposals();
      // console.log(result);
      setProposals(result);
      getProporsalsByStatus(result, selectedFilter);
    })();
  }, [])

  useEffect(() => {
    getProporsalsByStatus(proposals, selectedFilter);
  }, [selectedFilter])

  // console.log(myProposals);

  //fetch total locked and Staking APY
  useEffect(() => {
    (async () => {
      const sefi_reward_token = await user.getRewardToken('SEFI')
      const { total_locked } = await user?.secretjs?.queryContractSmart(process.env.SEFI_STAKING_CONTRACT, { "total_locked": {} })
      const totalLocked = total_locked?.amount;

      setRewardToken(sefi_reward_token)
      setTotalLocked(totalLocked)

    })();

  }, [tokens.allData])

  //update voting power
  useEffect(() => {
    (async (a) => {
      if (a) {
        await user.refreshTokenBalanceByAddress(a.lockedAssetAddress);
        await user.refreshRewardsBalances('', a.rewardsContract);
        setVotingPower(user.balanceToken[a.lockedAssetAddress]);
        // setVotingPower(user.balanceRewards[rewardsDepositKey(a.rewardsContract)]); //SEFI Staking
      }

    })(rewardToken);

  }, [rewardToken])

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

            <div className='column-stats'>
              <div className="stats-apy">
                {(rewardToken) ? <h1>{apyString(rewardToken)}</h1> : <SpinnerLineHor />}
                <div>
                  <p>Staking APY</p>
                </div>
              </div>
              <div className="stats-power">
                <div>
                  {
                    votingPower ?
                      (votingPower) && (votingPower?.includes(unlockToken) || !votingPower)
                        ? unlockJsx({ onClick: createSefiViewingKey })
                        : <h1>{numeral(votingPower).format('0,0.00')}
                          <span className='pink'>SEFI </span>
                          <span>({numeral((votingPower * 100) / totalLocked).format('0.00%')})</span>
                        </h1>
                      : <SpinnerLineHor />
                  }
                </div>
                <div>
                  <p>My Voting Power</p>
                </div>
              </div>
              <div className="stats-voting">
                {
                  totalLocked ?
                    <h1>{numeral(formatNumber(totalLocked)).format('0,0.00')} <span className='pink'>SEFI</span></h1>
                    : <SpinnerLineHor />
                }
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
              <h3>{capitalizeFirstLetter(selectedFilter)} Proposals</h3>
              <div className='filters'>
                {
                  filters.map((filter, i) => {
                    return (
                      <Button
                        key={`${i}${filter}`}
                        onClick={() => { setFilter(filter) }}
                        className={
                          (filter === selectedFilter)
                            ? 'active filter-button'
                            : 'filter-button'
                        }
                      >
                        {capitalizeFirstLetter(filter)}
                        {` (${countStatus(filter)})`}
                      </Button>
                    )
                  })
                }
              </div>
            </div>
            <div className='list-proposal'>
              {
                filtered.map((p, index) => {
                  return (
                    <ProposalRow
                      key={p.id}
                      index={index}
                      theme={theme}
                      title={p.title}
                      endTime={p.end_date}
                      status={p.status}
                      id={p.id}
                    />
                  )
                })
              }
            </div>
          </div>
          {/* </div> */}
        </Box>
      </PageContainer>
    </BaseContainer >
  );
});