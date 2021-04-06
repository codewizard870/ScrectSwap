import React from 'react';
import { Box } from 'grommet';
import * as styles from '../FAQ/faq-styles.styl';
import { PageContainer } from 'components/PageContainer';
import { BaseContainer } from 'components/BaseContainer';
import { useStores } from 'stores';
import { fixUnlockToken, isEmptyObject, sleep, unlockToken } from 'utils';
import { UserStoreEx } from 'stores/UserStore';
import { observer } from 'mobx-react';
import { SwapTab } from './SwapTab';
import { ProvideTab } from './ProvideTab';
import { WithdrawTab } from './WithdrawTab';
import { BigNumber } from 'bignumber.js';
import { getNativeBalance, unlockJsx, wrongViewingKey } from './utils';
import { BetaWarning } from '../../components/Swap/BetaWarning';
import { SwapFooter } from './Footer';
import { GetSnip20Params } from '../../blockchain-bridge';
import { loadTokensFromList } from './LocalTokens/LoadTokensFromList';
import { ISecretSwapPair, ITokenInfo } from '../../stores/interfaces';
import { Tokens } from '../../stores/Tokens';
import { getSymbolsFromPair } from '../../blockchain-bridge/scrt/swap';
import { SwapToken, SwapTokenMap, TokenMapfromITokenInfo } from './types/SwapToken';
import LocalStorageTokens from '../../blockchain-bridge/scrt/CustomTokens';
import cogoToast from 'cogo-toast';
import { pairIdFromTokenIds, PairMap, SwapPair } from './types/SwapPair';
import { KeplrButton } from '../../components/Secret/KeplrButton';
import { NativeToken, Token } from './types/trade';
import { SecretSwapPairs } from 'stores/SecretSwapPairs';
import Graph from 'node-dijkstra';
import { HistoryTab } from './HistoryTab';
import { SecretSwapPools } from 'stores/SecretSwapPools';

export const SwapPageWrapper = observer(() => {
  // SwapPageWrapper is necessary to get the user store from mobx 🤷‍♂️
  let { user, tokens, secretSwapPairs, secretSwapPools } = useStores();
  secretSwapPairs.init({
    isLocal: true,
    sorter: 'none',
    pollingInterval: 60000,
  });
  secretSwapPairs.fetch();

  if (process.env.ENV === 'DEV') {
    tokens = { allData: JSON.parse(process.env.AMM_TOKENS) } as Tokens;
    secretSwapPairs = { allData: JSON.parse(process.env.AMM_PAIRS) } as SecretSwapPairs;
    secretSwapPools = null;
  } else {
    tokens.init();

    secretSwapPools.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 60000,
    });
    secretSwapPools.fetch();
  }

  return <SwapRouter user={user} tokens={tokens} pairs={secretSwapPairs} pools={secretSwapPools} />;
});

export class SwapRouter extends React.Component<
  {
    user: UserStoreEx;
    tokens: Tokens;
    pairs: SecretSwapPairs;
    pools: SecretSwapPools;
  },
  {
    allTokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    pairs: PairMap;
    selectedPair: SwapPair | undefined;
    selectedToken0: string;
    selectedToken1: string;
    queries: string[];
    routerSupportedTokens: Set<string>;
    routingGraph: { [token0: string]: { [token1: string]: number } };
    selectedPairRoutes: string[][];
  }
> {
  private symbolUpdateHeightCache: { [symbol: string]: number } = {};
  private ws: WebSocket;

  constructor(props: { user: UserStoreEx; tokens: Tokens; pairs: SecretSwapPairs; pools: SecretSwapPools }) {
    super(props);
    window.onhashchange = this.onHashChange;
    this.state = {
      allTokens: new Map<string, SwapToken>(),
      balances: {},
      pairs: new Map<string, SwapPair>(),
      selectedPair: undefined,
      selectedToken0: process.env.SSCRT_CONTRACT,
      selectedToken1: '',
      queries: [],
      routerSupportedTokens: new Set(),
      routingGraph: {},
      selectedPairRoutes: [],
    };

    if (process.env.ENV !== 'DEV') {
      setInterval(() => {
        const balances = {};
        for (const pool of props.pools.allData) {
          let id0: string;
          let id1: string;

          if ('native_token' in pool.assets[0].info) {
            id0 = pool.assets[0].info.native_token.denom;
          } else {
            id0 = pool.assets[0].info.token.contract_addr;
          }
          if ('native_token' in pool.assets[1].info) {
            id1 = pool.assets[1].info.native_token.denom;
          } else {
            id1 = pool.assets[1].info.token.contract_addr;
          }

          const pair = this.state.pairs.get(`${id0}${SwapPair.id_delimiter}${id1}`);

          if (!pair) {
            // pairs or tokens aren't loaded yet
            continue;
          }

          balances[`${pair.liquidity_token}-total-supply`] = new BigNumber(pool.total_share);

          balances[`${id0}-${pair.identifier()}`] = new BigNumber(pool.assets[0].amount);
          balances[`${id1}-${pair.identifier()}`] = new BigNumber(pool.assets[1].amount);
        }
        this.setState(currentState => ({ balances: { ...currentState.balances, ...balances } }));
      }, 1000);
    }
  }

  onHashChange = () => {
    this.forceUpdate();
  };

  async componentDidUpdate(previousProps, prevState) {
    if (previousProps.tokens.allData.length !== this.props.tokens.allData.length) {
      await this.updateTokens();
    }

    if (previousProps.pairs.allData.length !== this.props.pairs.allData.length) {
      await this.updatePairs();
    }

    const tokensToRefresh = [];

    if (this.state.selectedToken1 && !this.state.balances[this.state.selectedToken1]) {
      tokensToRefresh.push(this.state.selectedToken1);
    }

    if (this.state.selectedToken0 && !this.state.balances[this.state.selectedToken0]) {
      tokensToRefresh.push(this.state.selectedToken0);
    }

    if (tokensToRefresh.length > 0) {
      await this.refreshBalances({ tokens: tokensToRefresh });
    }

    if (
      prevState.selectedToken0 !== this.state.selectedToken0 ||
      prevState.selectedToken1 !== this.state.selectedToken1
    ) {
      //this.unSubscribeAll();
      // Register for token or SCRT events
      //this.registerTokenQueries(this.state.selectedToken0, this.state.selectedToken1);
      // Register for pair events
      //this.registerPairQueries(this.state.selectedPair);
      // Register for pair events along all routes,
      // because we need to know about changes in pool sizes
      //this.registerRoutesQueries();
    }
  }

  async reRegisterPairHooks() {}

  async componentDidMount() {
    window.addEventListener('storage', this.updateTokens);
    window.addEventListener('updatePairsAndTokens', this.updatePairs);

    if (!this.props.user.secretjs) {
      await this.updateTokens();
    }

    while (this.props.pairs.isPending || this.props.tokens.isPending) {
      await sleep(100);
    }

    await this.updatePairs();

    // this.props.user.websocketTerminate(true);
    //
    // this.ws = new WebSocket(process.env.SECRET_WS);
    //
    // this.ws.onmessage = async event => {
    //   await this.onMessage(event);
    // };

    // this.ws.onopen = async () => {
    //   // Here we register for token related events
    //   // Then in onmessage we know when to refresh all the balances
    //   while (!this.props.user.address) {
    //     await sleep(100);
    //   }
    //
    //   // Register for SCRT events
    //   //this.registerSCRTQueries();
    //
    //   // Register for token or SCRT events
    //   // this.registerTokenQueries();
    //   //
    //   // // Register for pair events
    //   // this.registerPairQueries();
    //   //}
    // };

    while (!this.props.user.secretjs) {
      await sleep(100);
    }

    const routerSupportedTokens: Set<string> = new Set(
      await this.props.user.secretjs.queryContractSmart(process.env.AMM_ROUTER_CONTRACT, {
        supported_tokens: {},
      }),
    );
    routerSupportedTokens.add('uscrt');

    this.setState({ routerSupportedTokens }, this.updateRoutingGraph);
  }

  private async refreshBalances({ pair, tokens, height }: { tokens: string[]; pair?: SwapPair; height?: number }) {
    if (!height) {
      height = await this.props.user.secretjs.getHeight();
    }

    //console.log(`Hello from refreshBalances for height: ${height}`);
    const balanceTasks = tokens.map(s => {
      return this.refreshTokenBalance(height, s);
    });

    // these will return a list of promises, which we will flatten then map to a single object
    if (pair) {
      balanceTasks.push(this.refreshLpTokenBalance(pair));
      balanceTasks.push(this.refreshPoolBalance(pair));
    }

    console.log('refreshing balances..');

    const results = await Promise.all([...balanceTasks]);

    console.log(`balances: ${JSON.stringify(results)}`);

    // flatten array to a single object
    const newObject = Object.assign(
      {},
      ...results.flat().map(item => ({ [Object.keys(item)[0]]: Object.values(item)[0] })),
    );

    this.setState(currentState => ({
      balances: {
        ...currentState.balances,
        ...newObject,
      },
    }));

    return newObject;
  }

  refreshPools = async ({ pair, height }: { pair: SwapPair; height?: number }) => {
    if (!height) {
      height = await this.props.user.secretjs.getHeight();
    }

    const balanceTasks = [];

    // these will return a list of promises, which we will flatten then map to a single object
    balanceTasks.push(this.refreshPoolBalance(pair));

    const results = await Promise.all([...balanceTasks]);

    // flatten array to a single object
    const newObject = Object.assign(
      {},
      ...results.flat().map(item => ({ [Object.keys(item)[0]]: Object.values(item)[0] })),
    );

    this.setState(currentState => ({
      balances: {
        ...currentState.balances,
        ...newObject,
      },
    }));

    return newObject;
  };

  private async onMessage(event: WebSocketMessageEvent | MessageEvent<any>) {
    try {
      const data = JSON.parse(event.data);

      if (isEmptyObject(data.result)) {
        return;
      }

      if (Number(data.id) === -1) {
        return;
      }

      const dataId: string = data.id;

      if (dataId.startsWith('pools-')) {
        const pair = this.state.pairs.get(dataId.replace('pools-', ''));
        await this.refreshPools({ pair });
        return;
      }

      let tokens: Array<string> = data.id.split('/');

      // refresh selected token balances as well
      if (this.state.selectedToken0) {
        tokens.push(this.state.allTokens.get(this.state.selectedToken0)?.identifier);
      }
      if (this.state.selectedToken1) {
        tokens.push(this.state.allTokens.get(this.state.selectedToken1)?.identifier);
      }

      tokens = [...new Set(tokens)];

      // todo: move this to another function
      const height = SwapRouter.getHeightFromEvent(data);

      console.log(`Refreshing ${tokens.join(' and ')} for height ${height}`);

      const pairSymbol: string = dataId;
      const pair = this.state.pairs.get(pairSymbol);

      await this.refreshBalances({ height, tokens, pair });
    } catch (error) {
      console.log(`Failed to refresh balances: ${error}`);
    }
  }

  private async refreshPoolBalance(pair: SwapPair) {
    const balances = [];

    if (process.env.ENV === 'DEV') {
      try {
        let res: {
          assets: Array<{ amount: string; info: Token | NativeToken }>;
          total_share: string;
        } = await this.props.user.secretjs.queryContractSmart(pair.contract_addr, {
          pool: {},
        });

        const amount0 = new BigNumber(res.assets[0].amount);
        const amount1 = new BigNumber(res.assets[1].amount);
        if ('native_token' in res.assets[0].info) {
          balances.push({
            [`${res.assets[0].info.native_token.denom}-${pair.identifier()}`]: amount0,
          });
        } else {
          balances.push({
            [`${res.assets[0].info.token.contract_addr}-${pair.identifier()}`]: amount0,
          });
        }
        if ('native_token' in res.assets[1].info) {
          balances.push({
            [`${res.assets[1].info.native_token.denom}-${pair.identifier()}`]: amount1,
          });
        } else {
          balances.push({
            [`${res.assets[1].info.token.contract_addr}-${pair.identifier()}`]: amount1,
          });
        }
      } catch (error) {
        this.notify('error', `Error getting pools' balances for ${pair.identifier()}: ${error.message}`);
      }
    }

    return balances;
  }

  private async refreshTokenBalance(height: number, tokenSymbol: string) {
    if (height <= this.symbolUpdateHeightCache[tokenSymbol]) {
      //console.log(`${tokenSymbol} already fresh for height ${height}`);
      return {};
    }

    let userBalancePromise; //balance.includes(unlockToken)
    if (tokenSymbol !== 'uscrt') {
      // todo: move this inside getTokenBalance?
      const tokenAddress = this.state.allTokens.get(tokenSymbol)?.address;

      if (!tokenAddress) {
        console.log('refreshTokenBalance: Cannot find token address for symbol', tokenSymbol);
        return {};
      }

      let balance = await this.props.user.getSnip20Balance(tokenAddress);

      if (balance === unlockToken) {
        balance = unlockJsx({
          onClick: async () => {
            await this.props.user.keplrWallet.suggestToken(this.props.user.chainId, tokenAddress);
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
      userBalancePromise = await getNativeBalance(this.props.user.address, this.props.user.secretjs);
    }
    this.symbolUpdateHeightCache[tokenSymbol] = height;
    return { [tokenSymbol]: userBalancePromise };
  }

  private async refreshLpTokenBalance(pair: SwapPair) {
    let returnBalances = [];

    const pairSymbol = pair.identifier();
    console.log('Refresh LP token for', pairSymbol);
    // update my LP token balance
    const lpTokenSymbol = `LP-${pairSymbol}`;
    const lpTokenAddress = pair.liquidity_token;
    if (process.env.ENV === 'DEV') {
      let lpTotalSupply = new BigNumber(0);
      try {
        const result = await GetSnip20Params({
          address: pair.liquidity_token,
          secretjs: this.props.user.secretjs,
        });
        lpTotalSupply = new BigNumber(result.total_supply);
        returnBalances.push({
          [`${lpTokenAddress}-total-supply`]: lpTotalSupply,
        });
      } catch (error) {
        console.error(`Error trying to get LP token total supply of ${pairSymbol}`, pair, error);
        return [];
      }
    }

    let balanceResult = await this.props.user.getSnip20Balance(lpTokenAddress);
    let lpBalance;
    if (balanceResult === unlockToken) {
      balanceResult = unlockJsx({
        onClick: async () => {
          await this.props.user.keplrWallet.suggestToken(this.props.user.chainId, lpTokenAddress);
          // TODO trigger balance refresh if this was an "advanced set" that didn't
          // result in an on-chain transaction
          await this.refreshLpTokenBalance(pair);
        },
      });
      lpBalance = balanceResult;
    } else if (balanceResult === fixUnlockToken) {
      lpBalance = wrongViewingKey;
    } else {
      lpBalance = new BigNumber(balanceResult);
    }

    returnBalances.push({
      [lpTokenSymbol]: lpBalance,
    });

    return returnBalances;
  }

  private static getHeightFromEvent(data) {
    const heightFromEvent =
      data?.result?.data?.value?.TxResult?.height || data?.result?.data?.value?.block?.header?.height || 0;
    const height = Number(heightFromEvent);

    // todo: why not break here?
    if (isNaN(height)) {
      console.error(
        `height is NaN for some reason. Unexpected behavior from here on out: got heightFromEvent=${heightFromEvent}`,
      );
    }
    return height;
  }

  private registerSCRTQueries() {
    const myAddress = this.props.user.address;
    const scrtQueries = [
      `message.sender='${myAddress}'` /* sent a tx (gas) */,
      `message.signer='${myAddress}'` /* executed a contract (gas) */,
      `transfer.recipient='${myAddress}'` /* received SCRT */,
    ];

    for (const query of scrtQueries) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 'uscrt', // jsonrpc id
          method: 'subscribe',
          params: { query },
        }),
      );
    }
  }

  private registerTokenQueries(token0: string, token1: string) {
    for (const token of [this.state.allTokens.get(token0), this.state.allTokens.get(token1)]) {
      console.log(`Registering queries for ${token.symbol}`);
      const tokenAddress = token.address;
      const tokenQueries = [`message.contract_address='${tokenAddress}'`, `wasm.contract_address='${tokenAddress}'`];
      for (const query of tokenQueries) {
        if (this.state.queries.includes(query)) {
          // already subscribed
          continue;
        }
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: token.identifier, // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
      }
      this.setState(currentState => ({
        queries: Array.from(new Set(currentState.queries.concat(tokenQueries))),
      }));
    }
  }

  private getPairQueries(pair: SwapPair): string[] {
    return [
      `message.contract_address='${pair.contract_addr}'`,
      `wasm.contract_address='${pair.contract_addr}'`,
      `message.contract_address='${pair.liquidity_token}'`,
      `wasm.contract_address='${pair.liquidity_token}'`,
    ];
  }

  private registerPairQueries(pair?: SwapPair) {
    const registerPair = pair || this.state.selectedPair;
    if (!registerPair) {
      console.log('Tried to register queries for empty pair');
      return;
    }

    const pairQueries = this.getPairQueries(pair);

    for (const query of pairQueries) {
      if (this.state.queries.includes(query)) {
        // alreay subscribed
        continue;
      }
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: registerPair.identifier(), // jsonrpc id
          method: 'subscribe',
          params: { query },
        }),
      );
    }
    this.setState(currentState => ({
      queries: Array.from(new Set(currentState.queries.concat(pairQueries))),
    }));
  }

  private getRoutesQueries(): { [pairId: string]: Array<string> } {
    const queris: { [pairId: string]: Set<string> } = {};

    for (const r of this.state.selectedPairRoutes) {
      for (let i = 0; i < r.length - 2; i++) {
        const pair = this.state.pairs.get(`${r[i]}${SwapPair.id_delimiter}${r[i + 1]}`);
        if (pair) {
          if (!(pair.identifier() in queris)) {
            queris[pair.identifier()] = new Set();
          }

          const pairQueries = this.getPairQueries(pair);
          for (const q of pairQueries) {
            queris[pair.identifier()].add(q);
          }
        }
      }
    }

    const result: { [pairId: string]: Array<string> } = {};
    for (const pairId in queris) {
      result[pairId] = Array.from(queris[pairId]);
    }

    return result;
  }

  private registerRoutesQueries() {
    const routesQueries = this.getRoutesQueries();

    if (Object.keys(routesQueries).length === 0) {
      return;
    }

    const queriesToStoreInState: Array<string> = [];
    for (const pairId in routesQueries) {
      for (const query of routesQueries[pairId]) {
        if (this.state.queries.includes(query)) {
          // alreay subscribed
          continue;
        }
        this.ws.send(
          JSON.stringify({
            jsonrpc: '2.0',
            id: `pools-${pairId}`, // jsonrpc id
            method: 'subscribe',
            params: { query },
          }),
        );
        queriesToStoreInState.push(query);
      }
    }

    this.setState(currentState => ({
      queries: Array.from(new Set(currentState.queries.concat(queriesToStoreInState))),
    }));
  }

  unSubscribePair(pair: SwapPair) {
    console.log(`Unsubscribing queries for ${pair.identifier()}`);

    const queries = this.getPairQueries(pair);
    for (const query of queries) {
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: '-1',
          method: 'unsubscribe',
          params: { query },
        }),
      );
    }

    this.setState(currentState => {
      let queries = currentState.queries;
      for (const query of this.getPairQueries(pair)) {
        queries = queries.filter(q => q !== query);
      }
      return { queries };
    });
  }

  unSubscribeAll() {
    for (const query of this.state.queries) {
      console.log(`Unsubscribing queries for ${query}`);
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          id: '-1',
          method: 'unsubscribe',
          params: { query },
        }),
      );
    }
    this.setState({ queries: [] });
  }

  async componentWillUnmount() {
    //this.props.user.websocketInit();

    if (this?.ws) {
      while (this.ws.readyState === WebSocket.CONNECTING) {
        await sleep(100);
      }

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000 /* Normal Closure */, 'See ya');
      }
    }

    window.removeEventListener('storage', this.updateTokens);
    window.removeEventListener('updatePairsAndTokens', this.updatePairs);
  }

  updateTokens = async () => {
    //console.log(...this.props.tokens.allData);
    const tokens: ITokenInfo[] = [...(await this.props.tokens.tokensUsage('SWAP'))];

    // convert to token map for swap
    const swapTokens: SwapTokenMap = TokenMapfromITokenInfo(tokens); // [...TokenMapfromITokenInfo(tokens), ...loadTokensFromList('secret-2')];

    // load custom tokens
    const customTokens = LocalStorageTokens.get();
    customTokens.forEach(t => {
      swapTokens.set(t.identifier, t);
    });

    //load hardcoded tokens (scrt, atom, etc.)
    for (const t of loadTokensFromList(this.props.user.chainId || process.env.CHAIN_ID)) {
      swapTokens.set(t.identifier, t);
    }

    this.setState({ allTokens: swapTokens });

    return swapTokens;
  };

  setCurrentPair = async (token0: string, token1: string) => {
    const selectedPair: SwapPair = this.state.pairs.get(pairIdFromTokenIds(token0, token1));

    const routes: string[][] = [];
    if (!selectedPair) {
      let graph = JSON.parse(JSON.stringify(this.state.routingGraph)); // deep copy
      try {
        while (true) {
          const dijkstra = new Graph(graph);
          const route: string[] = dijkstra.path(token0, token1) ?? [];

          if (route.length <= 2) {
            break;
          }
          routes.push(route);

          delete graph[route[0]][route[1]];
          delete graph[route[1]][route[0]];
        }
      } catch (e) {
        console.error('Error computing selectedPairRoutes:', e.message);
      }
    }

    this.setState({
      selectedPair: selectedPair,
      selectedPairRoutes: routes,
    });

    const height = await this.props.user.secretjs.getHeight();
    await this.refreshBalances({ height, tokens: [token0, token1], pair: selectedPair });
  };

  updatePairs = async () => {
    // gather tokens from our list, and from local storage
    const tokens = await this.updateTokens();

    let pairs: ISecretSwapPair[] = Array.from(this.props.pairs.allData);

    // filter all pairs that aren't known tokens
    pairs = pairs.filter(p => {
      const pairSymbols = getSymbolsFromPair(p);
      for (const s of pairSymbols) {
        if (!tokens.has(s)) {
          return false;
        }
      }

      if (pairSymbols.includes('uscrt') && !pairSymbols.includes(process.env.SSCRT_CONTRACT)) {
        // Unauthuorized SCRT pair
        return false;
      }

      return true;
    });

    const newPairs: PairMap = new Map<string, SwapPair>();

    for (const p of pairs) {
      try {
        const newPair = SwapPair.fromPair(p, tokens);
        newPairs.set(newPair.identifier(), newPair);
        newPairs.set(
          newPair
            .identifier()
            .split(SwapPair.id_delimiter)
            .reverse()
            .join(SwapPair.id_delimiter),
          newPair,
        );
      } catch (error) {
        console.error(error);
      }
    }

    this.setState({ pairs: newPairs }, this.updateRoutingGraph);
  };

  updateRoutingGraph = () => {
    const { pairs, routerSupportedTokens } = this.state;

    const graph = {};
    for (const pair of new Set(pairs.values())) {
      const [token0, token1] = pair.assetIds();
      if (!routerSupportedTokens.has(token0) || !routerSupportedTokens.has(token1)) {
        continue;
      }

      if (!(token0 in graph)) {
        graph[token0] = {};
      }
      if (!(token1 in graph)) {
        graph[token1] = {};
      }

      graph[token0][token1] = 1;
      graph[token1][token0] = 1;
    }

    this.setState({ routingGraph: graph });
  };

  notify(type: 'success' | 'error', msg: string, hideAfterSec: number = 120) {
    if (type === 'error') {
      msg = msg.replaceAll('Failed to decrypt the following error message: ', '');
      msg = msg.replace(/\. Decryption error of the error message:.+?/, '');
    }

    const { hide } = cogoToast[type](msg, {
      position: 'top-right',
      hideAfter: hideAfterSec,
      onClick: () => {
        hide();
      },
    });
    // NotificationManager[type](undefined, msg, closesAfterMs);
  }

  render() {
    const isSwap = window.location.hash === '#Swap';
    const isProvide = window.location.hash === '#Provide';
    const isWithdraw = window.location.hash === '#Withdraw';
    const isPools = window.location.hash === '#Pool';
    const isHistory = window.location.hash === '#History';

    if (!isSwap && !isProvide && !isWithdraw && !isPools && !isHistory) {
      window.location.hash = 'Swap';
      return <></>;
    }

    return (
      <BaseContainer>
        <PageContainer>
          <Box
            className={styles.faqContainer}
            pad={{ horizontal: 'large', top: 'large' }}
            style={{ alignItems: 'center' }}
          >
            <Box
              style={{
                maxWidth: '420px',
                minWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              pad={{ bottom: 'medium' }}
            >
              <KeplrButton />
              {isSwap && (
                <SwapTab
                  secretjs={this.props.user.secretjs}
                  secretjsSender={this.props.user.secretjsSend}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  selectedPair={this.state.selectedPair}
                  selectedToken0={this.state.selectedToken0}
                  selectedToken1={this.state.selectedToken1}
                  selectedPairRoutes={this.state.selectedPairRoutes}
                  notify={this.notify}
                  onSetTokens={async (token0, token1) => await this.onSetTokens(token0, token1)}
                  refreshPools={this.refreshPools}
                  secretAddress={this.props.user.address}
                  pairs={this.state.pairs}
                />
              )}
              {isProvide && (
                <ProvideTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  secretjsSender={this.props.user.secretjsSend}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  selectedPair={this.state.selectedPair}
                  selectedToken0={this.state.selectedToken0}
                  selectedToken1={this.state.selectedToken1}
                  notify={this.notify}
                  onSetTokens={async (token0, token1) => await this.onSetTokens(token0, token1)}
                />
              )}
              {isWithdraw && (
                <WithdrawTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  secretjsSender={this.props.user.secretjsSend}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  notify={this.notify}
                  updateToken={async (pair: SwapPair) => {
                    //this.registerPairQueries(pair);
                    await this.refreshBalances({
                      pair,
                      tokens: pair.assetIds(),
                    });
                  }}
                  onCloseTab={pair => {
                    //this.unSubscribePair(pair);
                  }}
                />
              )}
              {/* {isHistory && (
                <HistoryTab
                  user={this.props.user}
                  secretjs={this.props.user.secretjs}
                  tokens={this.state.allTokens}
                  balances={this.state.balances}
                  pairs={this.state.pairs}
                  notify={this.notify}
                  updateToken={async (pair: SwapPair) => {
                    this.registerPairQueries(pair);
                    await this.refreshBalances({
                      pair,
                      tokens: pair.assetIds(),
                    });
                  }}
                  onCloseTab={pair => {
                    this.unSubscribePair(pair);
                  }}
                />
              )} */}
            </Box>
            <SwapFooter />
            <BetaWarning secretjs={this.props.user.secretjsSend} />
          </Box>
        </PageContainer>
      </BaseContainer>
    );
  }

  private onSetTokens = async (token0, token1) => {
    this.setState(currentState => ({
      ...currentState,
      selectedToken0: token0,
      selectedToken1: token1,
    }));
    if (token0 && token1) {
      await this.setCurrentPair(token0, token1);
    }
  };
}
