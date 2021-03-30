import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from '../EthBridge/styles.styl';
// import { IColumn, Table } from '../../components/Table';
// import { ERC20Select } from '../Exchange/ERC20Select';
import EarnRow from '../../components/Earn/EarnRow';
import { rewardsDepositKey, rewardsKey } from '../../stores/UserStore';
import { divDecimals, sleep, truncateAddressString } from '../../utils';
import { InfoModalEarn } from '../../components/InfoModalEarn';
import { Icon } from 'components/Base/components/Icons';
import EarnInfoBox from '../../components/Earn/EarnInfoBox';
import { IRewardPool, ITokenInfo } from '../../stores/interfaces';
import Loader from 'react-loader-spinner';
import { Text } from 'components/Base';
import { notify } from '../Earn';
import * as thisStyles from './styles.styl';
import cn from 'classnames';
import { ethMethodsSefi } from '../../blockchain-bridge/eth';
import { CheckClaimModal } from '../../components/Earn/ClaimToken/CheckClaim';

function SefiBalance(props: { address: string, sefiBalance: string | JSX.Element }) {
  return (
    // <div style={{ display: 'flex', justifyContent: 'center' }}>
    //   <Text>Balance:{'  '}</Text>
    //   {props.sefiBalance || <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}
    // </div>
    //style={{display: "flex", justifyContent: "center"}}>
    <div className={cn(thisStyles.balanceContainer)}>

      <button className={cn(thisStyles.balanceButton)} >
        <Text>
          {truncateAddressString(props.address, 10)}
        </Text>
      </button>
      <div className={cn(thisStyles.balanceAmount)}>
        {props.sefiBalance ? (<Text>{props.sefiBalance} {' '} {"SEFI"}</Text>) :
          <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />}
      </div>
    </div>
  );
}

interface RewardData {
  reward: IRewardPool;
  token: ITokenInfo;
}

export const SeFiPage = observer(() => {
  const { user, tokens, rewards, userMetamask } = useStores();

  const [filteredTokens, setFilteredTokens] = useState<ITokenInfo[]>([]);

  const [sefiBalance, setSefiBalance] = useState<string | JSX.Element>('');

  const [sefiBalanceErc, setSefiBalanceErc] = useState<string>(undefined);

  const [rewardsData, setRewardsData] = useState<RewardData[]>([]);

  useEffect(() => {
    const asyncWrapper = async () => {
      while (rewards.isPending) {
        await sleep(100);
      }
      const mappedRewards = rewards.allData
        .filter(rewards => filteredTokens.find(element => element.dst_address === rewards.inc_token.address))
        .map(reward => {
          return { reward, token: filteredTokens.find(element => element.dst_address === reward.inc_token.address) };
        });

      setRewardsData(mappedRewards);
    };
    asyncWrapper().then(() => {});
  }, [filteredTokens, rewards, rewards.data]);

  const testSetTokens = useCallback(() => {
    const asyncWrapper = async () => {
      if (tokens.allData.length > 0) {
        await sleep(500);
        setFilteredTokens(tokens.tokensUsageSync('LPSTAKING'));
      }
    };
    asyncWrapper();
  }, [tokens, tokens.allData]);

  useEffect(() => {
    testSetTokens();
  }, [testSetTokens]);

  useEffect(() => {
    const asyncWrapper = async () => {
      if (userMetamask.ethAddress) {
        setSefiBalanceErc(await ethMethodsSefi.checkGovBalance(userMetamask.ethAddress))
      }
    }

    asyncWrapper();
  }, [userMetamask.ethAddress]);

  useEffect(() => {
    const refreshAllTokens = async () => {
      // if (filteredTokens.length <= 0) {
      //   return;
      // }
      while (!user.secretjs || tokens.isPending) {
        await sleep(100);
      }
      await Promise.all([...filteredTokens.map(token => user.updateBalanceForSymbol(token.display_props.symbol))]);
      setSefiBalance(user.balanceToken['wSEFI']);
    };

    // const getSefiRewards = async () => {
    //   while (!user.secretjs) {
    //     await sleep(100);
    //   }
    //
    //
    // }

    refreshAllTokens().then(() => {});
  }, [filteredTokens]);

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();
    tokens.init();
  }, []);

  return (
    <BaseContainer>
      <PageContainer>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100px',
            padding: '16px',
            position: 'absolute',
            left: '0',
            top: '100px',
            backgroundColor: '#F5F8FE',
            zIndex: -1,
          }}
        />
        <div
          style={{
            display: 'flex',
            minWidth: '550px',
            maxWidth: '1100px',
            backgroundColor: '#F5F8FE',
          }}
        >
          <Icon
            glyph="InfoIcon"
            size="medium"
            color={'black'}
            style={{
              display: 'inline-block',
              marginRight: '16px',
            }}
          />
          <p
            style={{
              minWidth: '550px',
              maxWidth: '1047px',
              display: 'inline-block',
            }}
          >
            If you have created viewing keys for secretTokens and secretSCRT, you should be able to see secretTokens
            locked in the rewards contract and your rewards. If you can't see these figures please refresh your browser.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            minWidth: '550px',
            maxWidth: '1100px',
            backgroundColor: '#F5F8FE',
            marginTop: '0.3em',
          }}
        >
          <Icon
            glyph="InfoIcon"
            size="medium"
            color={'black'}
            style={{
              display: 'inline-block',
              marginRight: '16px',
            }}
          />
        </div>
        <Box direction="row" wrap={true} fill={true} justify="center" align="start">
          <Box direction="column" align="center" justify="center">
            <EarnInfoBox type={'LPSTAKING'} />
            <div style={{display: "flex", justifyContent: "center"}}>
              <SefiBalance address={user.address} sefiBalance={sefiBalance} />
              <CheckClaimModal secretjs={user.secretjs} address={user.address} isEth={false}/>
              {/*<ClaimTokenErc />*/}
              {/*<ClaimTokenScrt />*/}
            </div>
            <div style={{display: "flex", justifyContent: "center"}}>
              <SefiBalance address={userMetamask.ethAddress} sefiBalance={sefiBalanceErc} />
              <CheckClaimModal address={userMetamask.ethAddress} isEth={true}/>
              {/*<ClaimTokenErc />*/}
              {/*<ClaimTokenScrt />*/}
            </div>
          </Box>
          <Box direction="column" align="center" justify="center" className={styles.base}>
            {rewardsData
              .slice()
              // .sort((a, b) => {
              //   /* ETH first */
              //   if (a.inc_token.symbol === 'sETH') {
              //     return -1;
              //   }
              //
              //   return 0;
              // })
              .map(rewardToken => {
                if (Number(rewardToken.reward.deadline) < 2_000_000) {
                  return null;
                }

                const rewardsToken = {
                  rewardsContract: rewardToken.reward.pool_address,
                  lockedAsset: rewardToken.reward.inc_token.symbol,
                  lockedAssetAddress: rewardToken.token.dst_address,
                  totalLockedRewards: divDecimals(
                    Number(rewardToken.reward.total_locked) * Number(rewardToken.token.price),
                    rewardToken.reward.inc_token.decimals,
                  ),
                  rewardsDecimals: String(rewardToken.reward.rewards_token.decimals),
                  rewards: user.balanceRewards[rewardsKey(rewardToken.reward.inc_token.symbol)],
                  deposit: user.balanceRewards[rewardsDepositKey(rewardToken.reward.inc_token.symbol)],
                  balance: user.balanceToken[rewardToken.token.src_coin],
                  decimals: rewardToken.token.decimals,
                  name: rewardToken.token.name,
                  price: rewardToken.token.price,
                  rewardsPrice: String(rewardToken.reward.rewards_token.price),
                  display_props: rewardToken.token.display_props,
                  remainingLockedRewards: rewardToken.reward.pending_rewards,
                  deadline: Number(rewardToken.reward.deadline),
                };

                return (
                  <EarnRow
                    notify={notify}
                    key={rewardToken.reward.inc_token.symbol}
                    userStore={user}
                    token={rewardsToken}
                  />
                );
              })}
          </Box>
        </Box>
        <InfoModalEarn />
      </PageContainer>
    </BaseContainer>
  );
});
