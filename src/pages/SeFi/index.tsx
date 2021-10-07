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
import {
  displayHumanizedBalance,
  divDecimals,
  fixUnlockToken,
  formatWithTwoDecimals,
  humanizeBalance,
  sleep,
  truncateAddressString,
  unlockToken,
} from '../../utils';
import { InfoModalEarn } from '../../components/InfoModalEarn';
import EarnInfoBox from '../../components/Earn/EarnInfoBox';
import { IRewardPool, ITokenInfo } from '../../stores/interfaces';
import Loader from 'react-loader-spinner';
import { Text } from 'components/Base';
import * as thisStyles from './styles.styl';
import cn from 'classnames';
import { ethMethodsSefi, web3 } from '../../blockchain-bridge/eth';
import { CheckClaimModal } from '../../components/Earn/ClaimToken/CheckClaim';
import { claimErc, claimScrt } from '../../components/Earn/ClaimToken/utils';
import { unlockJsx, wrongViewingKey } from 'pages/Swap/utils';
import BigNumber from 'bignumber.js';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from 'pages/TokenModal/types/SwapToken';
import { notify } from '../../blockchain-bridge/scrt/utils';
import ToggleButton from 'components/Earn/ToggleButton';

const Web3 = require('web3');

const sefiAddr = '0x773258b03c730f84af10dfcb1bfaa7487558b8ac';
const abi = {
  constant: true,
  inputs: [],
  name: 'totalSupply',
  outputs: [
    {
      name: '',
      type: 'uint256',
    },
  ],
  type: 'function',
};

// // Get ERC20 Token contract instance
// let contract = new web3.eth.Contract(abi).at(sefiAddr);

// // Call function
// contract.totalSupply((error, totalSupply) => {
//   console.log("Total Supply: " + totalSupply.toString());
// });
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

const order = [
  'SEFI',
  'LP-SUSDC-SUSDC(BSC)',
  'LP-SETH-SETH(BSC)',
  'LP-SSCRT-SUSDT',
  'LP-SSCRT-SETH',
  'LP-SSCRT-SWBTC',
  'LP-SSCRT-SEFI',
  'LP-SEFI-SXMR',
  'LP-SEFI-SUSDC',
  'LP-SETH-SWBTC',
  'LP-SSCRT-SDAI',
  'LP-SSCRT-SBNB(BSC)',
  'LP-SSCRT-SLINK',
  'LP-SSCRT-SRS',
  'LP-SSCRT-SOCEAN',
  'LP-SSCRT-SRUNE',
  'LP-SSCRT-SYFI',
  'LP-SSCRT-SDOT(BSC)',
  'LP-SSCRT-SMANA',
];

export const SeFiPage = observer(() => {
  const { user, tokens, rewards, userMetamask, theme } = useStores();

  const [filteredTokens, setFilteredTokens] = useState<ITokenInfo[]>([]);
  const [showOldPools, setShowOldPools] = useState<boolean>(true);
  const [earnings, setEarnings] = useState('0');
  const [sefiBalance, _setSefiBalance] = useState<string | JSX.Element>('');

  function setSefiBalance(balance: string) {
    if (balance === unlockToken) {
      balance = unlockJsx({
        onClick: async () => {
          await user.keplrWallet.suggestToken(user.chainId, process.env.SCRT_GOV_TOKEN_ADDRESS);
          await user.updateBalanceForSymbol('SEFI');
          setSefiBalance(user.balanceToken['SEFI']);
        },
      });
      _setSefiBalance(balance);
    } else if (balance === fixUnlockToken) {
      _setSefiBalance(wrongViewingKey);
    } else {
      _setSefiBalance(balance);
    }
  }

  async function addSefiToWatchlist() {
    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await web3.currentProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: process.env.ETH_GOV_TOKEN_ADDRESS, // The address that the token is at.
            symbol: 'SEFI', // A ticker symbol or shorthand, up to 5 chars.
            decimals: 6, // The number of decimals in the token
            image: 'https://pbs.twimg.com/profile_images/1361712479546474498/1a3370iV_400x400.jpg', // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        notify('success', 'SeFi in on your watchlist on Metamask');
      }
    } catch (error) {
      notify('error', `Failed to add SeFi to the watchlist on Metamask: ${error}`);
      console.log(`Failed to add SeFi to the watchlist on Metamask: ${error}`);
    }
  }

  const [sefiBalanceErc, setSefiBalanceErc] = useState<string>(undefined);
  const [rewardsData, setRewardsData] = useState<RewardData[]>([]);
  const getTotalEarnings = () => {
    const mappedEarnings = rewards.allData
      .filter(rewards => filteredTokens.find(element => element.dst_address === rewards.inc_token.address))
      .map(reward => {
        return {
          earnings: user.balanceRewards[rewardsKey(reward.inc_token.address)],
          symbol: reward.inc_token.symbol,
        };
      });
    const totalEarnigs: number = mappedEarnings.reduce((sum, earns) => {
      if (earns.earnings) {
        return sum + parseFloat(earns?.earnings);
      } else {
        return sum + 0;
      }
    }, 0);

    setEarnings(totalEarnigs.toString());
  };
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
    (async () => {
      if (userMetamask.ethAddress) {
        const balanceResult = await ethMethodsSefi.checkGovBalance(userMetamask.ethAddress);

        const asBigNumber = new BigNumber(balanceResult);
        if (asBigNumber.isNaN()) {
          setSefiBalanceErc(balanceResult);
        } else {
          setSefiBalanceErc(displayHumanizedBalance(humanizeBalance(asBigNumber, 6), null, 6));
        }
      }
    })();
  }, [userMetamask, userMetamask.ethAddress]);

  useEffect(() => {
    const refreshSefi = async () => {
      // if (filteredTokens.length <= 0) {
      //   return;
      // }
      while (!user.secretjs || tokens.isPending) {
        await sleep(100);
      }
      await user.updateBalanceForSymbol('SEFI');
      //await Promise.all(filteredTokens.map(token => user.updateBalanceForSymbol(token.display_props.symbol)));
      setSefiBalance(user.balanceToken['SEFI']);
    };

    refreshSefi().then(() => {});
  }, []);

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();
    tokens.init();
  }, []);

  console.log(`${JSON.stringify(rewardsData)}`);

  return (
    <BaseContainer>
      <PageContainer>
        <Box
          style={{ width: '100%', paddingInline: '22%' }}
          direction="row"
          wrap={true}
          fill={true}
          justify="end"
          align="center"
        >
          <h4 className={`${theme.currentTheme} old_pools`}>Show inactive pools: </h4>
          <ToggleButton value={showOldPools} onClick={() => setShowOldPools(!showOldPools)} />
        </Box>
        <Box style={{ width: '100%' }} direction="row" wrap={true} fill={true} justify="center" align="start">
          <Box direction="column" align="center" justify="center" className={styles.base}>
            {rewardsData
              .slice()
              .sort((a, b) => {
                const testA = a.reward.inc_token.symbol.toUpperCase();
                const testB = b.reward.inc_token.symbol.toUpperCase();
                if (order.indexOf(testA) === -1) return 1;
                if (order.indexOf(testB) === -1) return -1;
                return order.indexOf(testA) - order.indexOf(testB);
              })
              .filter(rewardToken => (process.env.TEST_COINS ? true : !rewardToken.reward.hidden))
              .filter(a => (a.reward.deprecated && showOldPools) || !a.reward.deprecated)
              .map((rewardToken, i) => {
                const rewardsToken = {
                  rewardsContract: rewardToken.reward.pool_address,
                  lockedAsset: rewardToken.reward.inc_token.symbol,
                  lockedAssetAddress: rewardToken.token.dst_address,
                  totalLockedRewards: divDecimals(
                    Number(rewardToken.reward.total_locked) * Number(rewardToken.reward.inc_token.price),
                    rewardToken.reward.inc_token.decimals,
                  ),
                  rewardsDecimals: String(rewardToken.reward.rewards_token.decimals),
                  rewards: user.balanceRewards[rewardsKey(rewardToken.reward.pool_address)],
                  deposit: user.balanceRewards[rewardsDepositKey(rewardToken.reward.pool_address)],
                  balance: user.balanceToken[rewardToken.token.dst_address],
                  decimals: rewardToken.token.decimals,
                  name: rewardToken.token.name,
                  price: String(rewardToken.reward.inc_token.price),
                  rewardsPrice: String(rewardToken.reward.rewards_token.price),
                  display_props: rewardToken.token.display_props,
                  remainingLockedRewards: rewardToken.reward.pending_rewards,
                  deadline: Number(rewardToken.reward.deadline),
                  rewardsSymbol: 'SEFI',
                  deprecated: rewardToken.reward.deprecated,
                  deprecated_by: rewardToken.reward.deprecated_by,
                };

                return (
                  <EarnRow
                    notify={notify}
                    key={`${rewardToken.reward.inc_token.symbol}-${i}`}
                    userStore={user}
                    token={rewardsToken}
                    callToAction="Sefi Earnings"
                    theme={theme}
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
