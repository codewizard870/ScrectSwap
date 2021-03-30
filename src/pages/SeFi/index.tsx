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
import { divDecimals, fixUnlockToken, sleep, truncateAddressString, unlockToken } from '../../utils';
import { InfoModalEarn } from '../../components/InfoModalEarn';
import EarnInfoBox from '../../components/Earn/EarnInfoBox';
import { IRewardPool, ITokenInfo } from '../../stores/interfaces';
import Loader from 'react-loader-spinner';
import { Text } from 'components/Base';
import { notify } from '../Earn';
import * as thisStyles from './styles.styl';
import cn from 'classnames';
import { ethMethodsSefi } from '../../blockchain-bridge/eth';
import { CheckClaimModal } from '../../components/Earn/ClaimToken/CheckClaim';
import { claimErc, claimScrt } from '../../components/Earn/ClaimToken/utils';
import { unlockJsx, wrongViewingKey } from 'pages/Swap/utils';

function SefiBalance(props: { address: string; sefiBalance: string | JSX.Element; isEth?: boolean }) {
  const src_img = props.isEth ? '/static/eth.png' : '/static/scrt.svg';

  return (
    <div className={cn(thisStyles.balanceContainer)}>
      <img className={styles.imgToken} style={{ height: 18 }} src={src_img} alt={'scrt'} />
      <button className={cn(thisStyles.balanceButton)}>
        <Text>{truncateAddressString(props.address, 10)}</Text>
      </button>
      <div className={cn(thisStyles.balanceAmount)}>
        {props.sefiBalance ? (
          <Text>
            {props.sefiBalance} {'SEFI'}
          </Text>
        ) : (
          <Loader type="ThreeDots" color="#00BFFF" height="1em" width="1em" />
        )}
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

  const [sefiBalance, _setSefiBalance] = useState<string | JSX.Element>('');
  function setSefiBalance(balance: string) {
    if (balance === unlockToken) {
      balance = unlockJsx({
        onClick: async () => {
          await user.keplrWallet.suggestToken(user.chainId, process.env.SCRT_GOV_TOKEN_ADDRESS);
          await user.updateBalanceForSymbol('wSEFI');
          setSefiBalance(user.balanceToken['wSEFI']);
        },
      });
      _setSefiBalance(balance);
    } else if (balance === fixUnlockToken) {
      _setSefiBalance(wrongViewingKey);
    } else {
      _setSefiBalance(balance);
    }
  }

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
        setSefiBalanceErc(await ethMethodsSefi.checkGovBalance(userMetamask.ethAddress));
      }
    };

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
        <Box direction="row" wrap={true} fill={true} justify="center" align="start">
          <Box direction="column" align="center" justify="center" style={{ marginTop: '10px' }}>
            <EarnInfoBox type={'LPSTAKING'} />

            <div
              style={{
                width: '1000px',
                padding: '20px',
                backgroundColor: 'transparent',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  borderRadius: '10px',
                  width: '45%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '5px',
                }}
              >
                <SefiBalance address={user.address} sefiBalance={sefiBalance} />
                <CheckClaimModal
                  secretjs={user.secretjs}
                  address={user.address}
                  isEth={false}
                  loadingBalance={false}
                  onClick={async () => {
                    try {
                      await claimScrt(user.secretjs, user.address);
                      notify('success', 'Claimed SeFi successfully!');
                      await user.updateBalanceForSymbol('SEFI');
                      setSefiBalance(user.balanceToken['wSEFI']);
                    } catch (e) {
                      console.error(`failed to claim ${e}`);
                      notify('error', 'Failed to claim SeFi!');
                    }
                  }}
                />
                {/*<ClaimTokenErc />*/}
                {/*<ClaimTokenScrt />*/}
              </div>

              <div
                style={{
                  borderRadius: '10px',
                  marginLeft: '200px',
                  width: '45%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '5px',
                }}
              >
                <SefiBalance address={userMetamask.ethAddress} sefiBalance={sefiBalanceErc} isEth={true} />
                <CheckClaimModal
                  address={userMetamask.ethAddress}
                  isEth={true}
                  loadingBalance={!sefiBalanceErc}
                  onClick={async () => {
                    try {
                      await claimErc();
                      notify('success', 'Claimed SeFi successfully!');
                    } catch (e) {
                      console.error(`failed to claim ${e}`);
                      notify('error', 'Failed to claim SeFi!');
                    }
                  }}
                />
                {/*<ClaimTokenErc />*/}
                {/*<ClaimTokenScrt />*/}
              </div>
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
