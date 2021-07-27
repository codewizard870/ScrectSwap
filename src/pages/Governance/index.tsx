import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Box } from 'grommet';
import moment from 'moment';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { observer } from 'mobx-react';
import { Button, Popup } from 'semantic-ui-react';
import { ProposalRow } from 'components/ProposalRow';
import SpinnerLineHor from '../../ui/Spinner/SpinnerLineHor';
import numeral from 'numeral';
import './style.scss';
import { calculateAPY, RewardsToken } from 'components/Earn/EarnRow';
import { unlockJsx } from 'pages/Swap/utils';
import { unlockToken, zeroDecimalsFormatter } from 'utils';
import { rewardsDepositKey } from 'stores/UserStore';
import axios from "axios";
import { numberFormatter } from '../../utils/formatNumber'
import { validate } from 'webpack';
import { STATUS } from '../../stores/interfaces';
import { HowItWorksModal } from './HowItWorksModal';


export const Governance = observer(() => {

  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  let { user, theme, tokens } = useStores();
  let query = new URLSearchParams(useLocation().search);
  const [rewardToken, setRewardToken] = React.useState<RewardsToken>(undefined);
  const [totalLocked, setTotalLocked] = React.useState(0.0);
  const [votingPower, setVotingPower] = React.useState(undefined);

  const filters = ['all', 'active', "passed", "failed"];

  const [proposals, setProposals] = useState([]);

  // console.log(filters);
  // console.log(proposals);

  const [filtered, setFiltered] = useState(proposals);

  // Get the actual filter on click button
  const [selectedFilter, setSelectedFilter] = useState('all');
  // console.log(filtered);

  // console.log(selectedFilter);

  function setFilter(filter: string): void { setSelectedFilter(filter) }

  const getProporsalsByStatus = (proposals: Array<any>, status: string) => {
    if (selectedFilter === 'all') {
      const sortAllDataNewewstToOldest = proposals.sort((a, b) => b.end_date - a.end_date)
      setFiltered(sortAllDataNewewstToOldest);
      // console.log('all');
    } else {
      const filter = proposals.filter((proposal => proposal.currentStatus.includes(status)));
      const sortAllDataNewewstToOldest = filter.sort((a, b) => b.end_date - a.end_date)
      setFiltered(sortAllDataNewewstToOldest);
      // console.log('filtered');
    }

  }

  const countStatus = (status: string) => {
    if (status == 'all') {
      return proposals.length;
    } else {
      return proposals.filter(e => e.currentStatus === status.trim()).length;
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

  async function createSefiViewingKey() {
    try {
      await user.keplrWallet?.suggestToken(user.chainId, process.env.SEFI_STAKING_CONTRACT);
      await user.updateBalanceForSymbol('SEFI');
      await user.refreshRewardsBalances('SEFI');
      await user.updateScrtBalance();
    } catch (e) {
      console.error("Error at creating new viewing key ", e)
    }
  }
  // console.log('Voting Power:', votingPower);
  // console.log('Total Voting Power: ', totalLocked);
  // console.log('Reward Token:', rewardToken);

  // console.log(typeof totalLocked);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  const calculateVotingPower = (!votingPower || !totalLocked) ? 0 : ((votingPower / totalLocked) * 100);
  const totalVotingPower = calculateVotingPower.toFixed(2);

  const calculateState = (prop) => {
    let endDate = moment.unix(prop.end_date)
    let now = moment();

    if (prop.status === 'in progress' && endDate > now) {
      return 'active'
    } else if (prop.status === 'in progress' && endDate <= now) {
      return 'tally in progress';
    } else if (prop.status === 'failed' && prop.valid === true) {
      return 'failed';
    } else if (prop.status === 'failed' && prop.valid === false) {
      return 'failed';
    } else if (prop.status === 'passed') {
      return 'passed';
    }
    return '';
  }

  // console.log('Filteres Proposals:', filtered.sort((a, b) => b.end_date - a.end_date));

  useEffect(() => {
    (async () => {
      const proposals = await user.getProposals();
      proposals.forEach(prop => prop.currentStatus = calculateState(prop));
      setProposals(proposals);
      getProporsalsByStatus(proposals, selectedFilter);
    })();
  }, [])

  useEffect(() => {
    getProporsalsByStatus(proposals, selectedFilter);
  }, [selectedFilter])

  //fetch total locked and Staking APY
  useEffect(() => {
    (async () => {
      const sefi_reward_token = await user.getRewardToken('SEFI')
      const { total_locked } = await user?.secretjs?.queryContractSmart(process.env.SEFI_STAKING_CONTRACT, { "total_locked": {} })
      const totalLocked = total_locked?.amount;
      const convertTotalLocked = totalLocked / (Math.pow(10, 6));

      setRewardToken(sefi_reward_token)
      setTotalLocked(convertTotalLocked)

    })();

  }, [tokens.allData])

  //update voting power
  useEffect(() => {
    (async (a) => {
      if (a) {
        await user.refreshTokenBalanceByAddress(a.lockedAssetAddress);
        await user.refreshRewardsBalances('', a.rewardsContract);
        setVotingPower(user.balanceRewards[rewardsDepositKey(a.rewardsContract)]); //SEFI Staking
      }

    })(rewardToken);

  }, [rewardToken])

  // console.log(filtered);
  // console.log(totalLocked);
  // console.log(rewardToken);

  // console.log(totalLocked / (Math.pow(10, 6)))

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
                        : <h1>{numberFormatter(votingPower, 2)}
                          <span className='pink'>SEFI </span>
                          <span>({totalVotingPower} %)</span>
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
                    <h1>{numberFormatter(totalLocked, 2)} <span className='pink'> SEFI</span></h1>
                    : <SpinnerLineHor />
                }
                <p>Total Voting Power</p>
              </div>
            </div>

            <div className='buttons'>
              <div className='buttons-container'>
                {
                  votingPower === undefined || votingPower === 0 ?
                    <>
                      <Popup
                        // className="icon-info__popup"
                        content='You need SEFI to participate in SecretSwap governance'
                        trigger={<a>
                          <Button
                            disabled={votingPower === 0 || isNaN(parseFloat(votingPower))} className='g-button'
                          >
                            Participate in Governance
                          </Button>
                        </a>}
                      />
                    </>
                    :
                    (<Link to='/sefistaking'>
                      <Button
                        disabled={votingPower === 0 || isNaN(parseFloat(votingPower))} className='g-button'
                      >
                        Participate in Governance
                      </Button>
                    </Link>
                    )
                }

                <Link to='/proposal'>
                  <Button className='g-button--outline'>Create proposal</Button>
                </Link>

                <HowItWorksModal />
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
                      address={p.address}
                      theme={theme}
                      title={p.title}
                      endTime={p.end_date}
                      status={p.status}
                      id={p.id}
                      finalized={p.finalized}
                      valid={p.valid}
                      currentStatus={p.currentStatus}
                      totalLocked={totalLocked}
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
