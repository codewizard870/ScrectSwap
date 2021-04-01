import React from 'react';
import { Button, Container } from 'semantic-ui-react';
import { canonicalizeBalance, humanizeBalance, sortedStringify } from 'utils';
import { SwapAssetRow } from './SwapAssetRow';
import { AdditionalInfo } from './AdditionalInfo';
import { PriceRow } from '../../components/Swap/PriceRow';
import { compute_offer_amount, compute_swap } from '../../blockchain-bridge/scrt/swap';
import { ExecuteResult, SigningCosmWasmClient } from 'secretjs';
//import { TabsHeader } from './TabsHeader';
import { BigNumber } from 'bignumber.js';
import { extractValueFromLogs, getFeeForExecute } from '../../blockchain-bridge';
import { SwapTokenMap } from './types/SwapToken';
import { FlexRowSpace } from '../../components/Swap/FlexRowSpace';
import { PairMap, SwapPair } from './types/SwapPair';
import { DownArrow } from '../../ui/Icons/DownArrow';
import cn from 'classnames';
import * as styles from './styles.styl';
import { storeTxResultLocally } from './utils';
import { RouteRow } from 'components/Swap/RouteRow';
import { Token } from './types/trade';

const BUTTON_MSG_ENTER_AMOUNT = 'Enter an amount';
const BUTTON_MSG_NO_TRADNIG_PAIR = 'Trading pair does not exist';
const BUTTON_MSG_LOADING_PRICE = 'Loading price data';
const BUTTON_MSG_NOT_ENOUGH_LIQUIDITY = 'Insufficient liquidity for this trade';
const BUTTON_MSG_SWAP = 'Swap';
const BUTTON_MSG_FINDING_ROUTE = 'Finding best route';

export class SwapTab extends React.Component<
  {
    secretjs: SigningCosmWasmClient;
    tokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    selectedToken0?: string;
    selectedToken1?: string;
    selectedPair: SwapPair;
    selectedPairRoutes: string[][];
    notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
    onSetTokens: CallableFunction;
    refreshPools: CallableFunction;
    secretAddress: string;
    pairs: PairMap;
  },
  {
    fromToken: string;
    toToken: string;
    fromInput: string;
    toInput: string;
    isFromEstimated: boolean;
    isToEstimated: boolean;
    spread: number;
    commission: number;
    priceImpact: number;
    slippageTolerance: BigNumber;
    buttonMessage: string;
    loadingSwap: boolean;
    loadingBestRoute: boolean;
    loadingBestRouteCount: number;
    bestRoute: string[];
    loadingPriceData: boolean;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      fromToken: this.props.selectedToken0 || this.props.tokens.get(process.env.SSCRT_CONTRACT)?.identifier || '',
      toToken: this.props.selectedToken1 || '',
      fromInput: '',
      toInput: '',
      isFromEstimated: false,
      isToEstimated: false,
      spread: 0,
      commission: 0,
      priceImpact: 0,
      slippageTolerance: new BigNumber(0.5 / 100),
      buttonMessage: BUTTON_MSG_ENTER_AMOUNT,
      loadingSwap: false,
      loadingBestRoute: false,
      loadingBestRouteCount: 0,
      bestRoute: null,
      loadingPriceData: false,
    };
  }

  componentDidUpdate(previousProps) {
    if (sortedStringify(previousProps.balances) !== sortedStringify(this.props.balances)) {
      this.updateInputs();
    }

    //initial load
    // if (previousProps.tokens.size !== this.props.tokens.size) {
    //   const fromToken = this.props.tokens.values().next().value.identifier;
    //   const toToken = '';
    //   this.setState({
    //     fromToken,
    //     toToken,
    //   });
    // }
  }

  async getOfferAndAskPools(
    fromToken: string,
    toToken: string,
    pair: SwapPair,
  ): Promise<{ offer_pool: BigNumber; ask_pool: BigNumber }> {
    const fromDecimals = this.props.tokens.get(fromToken).decimals;
    const toDecimals = this.props.tokens.get(toToken).decimals;

    // we normalize offer_pool & ask_pool
    // we could also canonicalize offer_amount & ask_amount
    // but this way is less code because we get the results normalized
    let offer_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${fromToken}-${pair.identifier()}`] as any),
      fromDecimals,
    );
    let ask_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${toToken}-${pair.identifier()}`] as any),
      toDecimals,
    );

    if (offer_pool.isNaN() || ask_pool.isNaN()) {
      const balances = await this.props.refreshPools({ pair });
      offer_pool = humanizeBalance(new BigNumber(balances[`${fromToken}-${pair.identifier()}`] as any), fromDecimals);
      ask_pool = humanizeBalance(new BigNumber(balances[`${toToken}-${pair.identifier()}`] as any), toDecimals);
    }

    return { offer_pool, ask_pool };
  }

  async updateInputsFromBestRoute() {
    if (Number(this.state.fromInput) === 0 && this.state.isToEstimated) {
      return;
    }
    if (Number(this.state.toInput) === 0 && this.state.isFromEstimated) {
      return;
    }
    if (Number(this.state.fromInput) === 0 && Number(this.state.toInput) === 0) {
      return;
    }

    this.setState({ loadingBestRoute: true, loadingBestRouteCount: 0, bestRoute: null });
    try {
      let { fromToken, toToken, fromInput, toInput } = this.state;

      const routes = this.props.selectedPairRoutes;
      for (let i = 0; i < routes.length; i++) {
        if (routes[i][0] === toToken && routes[i][routes[i].length - 1] === fromToken) {
          routes[i] = routes[i].reverse();
        }
      }

      let bestRoute: string[] = null;
      let bestRouteToInput = new BigNumber(0);
      let bestRouteFromInput = new BigNumber(Infinity);
      let bestRoutePriceImpact = 0;
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        this.setState({ loadingBestRouteCount: i });

        if (this.state.isToEstimated /* top input is filled */) {
          let from = new BigNumber(fromInput);
          let to = new BigNumber(0);
          let priceImpacts: number[] = [];
          for (let i = 0; i < route.length - 1; i++) {
            const fromToken = route[i];
            const toToken = route[i + 1];
            const pair: SwapPair = this.props.pairs.get(`${fromToken}${SwapPair.id_delimiter}${toToken}`);

            const { offer_pool, ask_pool } = await this.getOfferAndAskPools(fromToken, toToken, pair);

            const offer_amount = from;
            if (
              offer_pool.isEqualTo(0) ||
              ask_pool.isEqualTo(0) ||
              offer_amount.isNaN() ||
              offer_amount.isLessThanOrEqualTo(0)
            ) {
              to = new BigNumber(0);
              break;
            }

            const { return_amount, spread_amount, commission_amount } = compute_swap(
              offer_pool,
              ask_pool,
              offer_amount,
            );

            if (return_amount.isNaN() || return_amount.isLessThanOrEqualTo(0)) {
              to = new BigNumber(0);
              break;
            }

            to = return_amount;
            priceImpacts.push(spread_amount.dividedBy(return_amount).toNumber());

            if (i < route.length - 2) {
              // setup for next iteration
              from = return_amount;
            }
          }

          if (to.isGreaterThan(bestRouteToInput)) {
            bestRouteToInput = to;
            bestRoute = route;
            bestRoutePriceImpact = Math.max(...priceImpacts);
          }
        } else {
          // isFromEstimated
          // bottom input is filled
          let from = new BigNumber(0);
          let to = new BigNumber(toInput);
          let priceImpacts: number[] = [];
          for (let i = route.length - 1; i > 0; i--) {
            const fromToken = route[i - 1];
            const toToken = route[i];
            const pair: SwapPair = this.props.pairs.get(`${fromToken}${SwapPair.id_delimiter}${toToken}`);
            const { offer_pool, ask_pool } = await this.getOfferAndAskPools(fromToken, toToken, pair);

            const ask_amount = to;
            if (
              offer_pool.isEqualTo(0) ||
              ask_pool.isEqualTo(0) ||
              ask_amount.gt(ask_pool) ||
              ask_amount.isNaN() ||
              ask_amount.isZero()
            ) {
              from = new BigNumber(Infinity);
              break;
            }

            const { offer_amount, spread_amount, commission_amount } = compute_offer_amount(
              offer_pool,
              ask_pool,
              ask_amount,
            );

            if (offer_amount.isNaN() || offer_amount.isLessThanOrEqualTo(0)) {
              from = new BigNumber(Infinity);
              break;
            }

            from = offer_amount;
            priceImpacts.push(spread_amount.dividedBy(ask_amount).toNumber());

            if (i > 1) {
              // setup for next iteration
              to = offer_amount;
            }
          }

          if (from.isLessThan(bestRouteFromInput)) {
            bestRouteFromInput = from;
            bestRoute = route;
            bestRoutePriceImpact = Math.max(...priceImpacts);
          }
        }
      }

      if (bestRoute) {
        if (this.state.isToEstimated) {
          const toDecimals = this.props.tokens.get(toToken).decimals;
          this.setState({
            toInput: bestRouteToInput.toFixed(toDecimals),
            bestRoute,
            commission: (0.3 / 100) * bestRouteToInput.toNumber(), // always denominated in toToken
            priceImpact: bestRoutePriceImpact,
          });
        } else {
          // isFromEstimated
          const fromDecimals = this.props.tokens.get(fromToken).decimals;
          this.setState({
            fromInput: bestRouteFromInput.toFixed(fromDecimals),
            bestRoute,
            commission: (0.3 / 100) * Number(this.state.toInput), // always denominated in toToken
            priceImpact: bestRoutePriceImpact,
          });
        }
      } else {
        if (this.state.isToEstimated) {
          this.setState({ toInput: '' });
        } else {
          // isFromEstimated
          this.setState({ fromInput: '' });
        }
      }
    } catch (e) {
      console.error('Error finding best route:', e.message);
    }

    this.setState({ loadingBestRoute: false, loadingBestRouteCount: 0 });
  }

  async updateInputs() {
    this.setState({ bestRoute: null });

    const pair = this.props.selectedPair;
    const routes = this.props.selectedPairRoutes;

    if (!pair && routes.length === 0) {
      this.setState({
        fromInput: '',
        isFromEstimated: false,
        toInput: '',
        isToEstimated: false,
      });
      return;
    }

    if (!pair && routes.length > 0) {
      this.updateInputsFromBestRoute();
      return;
    }

    this.setState({ loadingPriceData: true });

    const fromDecimals = this.props.tokens.get(this.state.fromToken).decimals;
    const toDecimals = this.props.tokens.get(this.state.toToken).decimals;

    // we normalize offer_pool & ask_pool
    // we could also canonicalize offer_amount & ask_amount
    // but this way is less code because we get the results normalized
    const offer_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${this.state.fromToken}-${pair.identifier()}`] as any),
      fromDecimals,
    );
    const ask_pool = humanizeBalance(
      new BigNumber(this.props.balances[`${this.state.toToken}-${pair.identifier()}`] as any),
      toDecimals,
    );

    if (offer_pool.isNaN() || ask_pool.isNaN() || offer_pool.isEqualTo(0) || ask_pool.isEqualTo(0)) {
      this.setState({ loadingPriceData: false });
      return;
    }

    if (this.state.isToEstimated) {
      const offer_amount = new BigNumber(this.state.fromInput);

      const { return_amount, spread_amount, commission_amount } = compute_swap(offer_pool, ask_pool, offer_amount);

      if (return_amount.isNaN() || this.state.fromInput === '') {
        this.setState({
          isFromEstimated: false,
          toInput: '',
          isToEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        this.setState({
          isFromEstimated: false,
          toInput: return_amount.isLessThan(0) ? '' : return_amount.toFixed(toDecimals),
          isToEstimated: return_amount.isGreaterThanOrEqualTo(0),
          spread: spread_amount.toNumber(),
          commission: commission_amount.toNumber(),
          priceImpact: spread_amount.dividedBy(return_amount).toNumber(),
        });
      }
    } else if (this.state.isFromEstimated) {
      const ask_amount = new BigNumber(this.state.toInput);

      const { offer_amount, spread_amount, commission_amount } = compute_offer_amount(offer_pool, ask_pool, ask_amount);

      if (offer_amount.isNaN() || this.state.toInput === '') {
        this.setState({
          isToEstimated: false,
          fromInput: '',
          isFromEstimated: false,
          spread: 0,
          commission: 0,
          priceImpact: 0,
        });
      } else {
        this.setState({
          isToEstimated: false,
          fromInput: offer_amount.isLessThan(0) ? '' : offer_amount.toFixed(fromDecimals),
          isFromEstimated: offer_amount.isGreaterThanOrEqualTo(0),
          spread: spread_amount.toNumber(),
          commission: commission_amount.toNumber(),
          priceImpact: spread_amount.dividedBy(ask_amount).toNumber(),
        });
      }
    }

    this.setState({ loadingPriceData: false });
  }

  render() {
    const pair = this.props.selectedPair;

    const ask_pool = pair
      ? new BigNumber(this.props.balances[`${this.state.toToken}-${pair?.identifier()}`] as BigNumber)
      : new BigNumber(0);
    const offer_pool = pair
      ? new BigNumber(this.props.balances[`${this.state.fromToken}-${pair?.identifier()}`] as BigNumber)
      : new BigNumber(0);

    const [fromBalance, toBalance] = [
      this.props.balances[this.state.fromToken],
      this.props.balances[this.state.toToken],
    ];

    const [fromDecimals, toDecimals] = [
      this.props.tokens.get(this.state.fromToken)?.decimals,
      this.props.tokens.get(this.state.toToken)?.decimals,
    ];

    const canonFromInput = canonicalizeBalance(new BigNumber(this.state.fromInput), fromDecimals);
    const canonToInput = canonicalizeBalance(new BigNumber(this.state.toInput), toDecimals);

    let buttonMessage: string;
    if (this.state.loadingPriceData) {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else if (this.state.loadingBestRoute) {
      buttonMessage = BUTTON_MSG_FINDING_ROUTE;
    } else if (this.state.bestRoute) {
      if (this.state.fromInput === '' && this.state.toInput === '') {
        buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
      } else if (new BigNumber(fromBalance as BigNumber).isLessThan(canonFromInput)) {
        buttonMessage = `Insufficient ${this.props.tokens.get(this.state.fromToken)?.symbol} balance`;
      } else if (this.state.fromInput === '' || this.state.toInput === '') {
        buttonMessage = BUTTON_MSG_LOADING_PRICE;
      } else {
        buttonMessage = BUTTON_MSG_SWAP;
      }
    } else if (this.props.selectedPairRoutes?.length > 0) {
      if (this.state.fromInput === '' && this.state.toInput === '') {
        buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
      } else {
        buttonMessage = BUTTON_MSG_NOT_ENOUGH_LIQUIDITY;
      }
    } else if (!pair) {
      buttonMessage = BUTTON_MSG_NO_TRADNIG_PAIR;
    } else if (this.state.fromInput === '' && this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_ENTER_AMOUNT;
    } else if (new BigNumber(fromBalance as BigNumber).isLessThan(canonFromInput)) {
      buttonMessage = `Insufficient ${this.props.tokens.get(this.state.fromToken)?.symbol} balance`;
    } else if (
      offer_pool.isZero() ||
      ask_pool.isZero() ||
      ask_pool.isLessThan(canonToInput) ||
      Number(this.state.fromInput) < 0 ||
      Number(this.state.toInput) < 0
    ) {
      buttonMessage = BUTTON_MSG_NOT_ENOUGH_LIQUIDITY;
    } else if (this.state.fromInput === '' || this.state.toInput === '') {
      buttonMessage = BUTTON_MSG_LOADING_PRICE;
    } else {
      buttonMessage = BUTTON_MSG_SWAP;
    }

    const hidePriceRow: boolean =
      this.state.toInput === '' ||
      this.state.fromInput === '' ||
      isNaN(Number(this.state.toInput) / Number(this.state.fromInput)) ||
      this.state.buttonMessage === BUTTON_MSG_LOADING_PRICE ||
      this.state.buttonMessage === BUTTON_MSG_NOT_ENOUGH_LIQUIDITY ||
      this.state.buttonMessage === BUTTON_MSG_NO_TRADNIG_PAIR;
    const price = Number(this.state.fromInput) / Number(this.state.toInput);

    return (
      <>
        <Container className={cn(styles.swapContainerStyle)}>
          {/* <TabsHeader /> */}
          <SwapAssetRow
            secretjs={this.props.secretjs}
            label="From"
            disabled={this.state.isFromEstimated && this.state.loadingBestRoute}
            maxButton={true}
            balance={fromBalance}
            tokens={this.props.tokens}
            token={this.state.fromToken}
            setToken={async (identifier: string) => {
              await this.setFromToken(identifier);
            }}
            amount={this.state.fromInput}
            isEstimated={
              false /* Eventually From is the exact amount that will be sent, so even if we estimate it in updateInputs we don't show the "(estimated)" label to the user */
            }
            setAmount={amount => this.setFromAmount(amount)}
          />
          <div
            style={{
              padding: '1em',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FlexRowSpace />
            <span
              style={{ cursor: 'pointer' }}
              onClick={() => {
                // switch
                this.setState(
                  {
                    toToken: this.state.fromToken,
                    toInput: this.state.isFromEstimated ? '' : this.state.fromInput,
                    isToEstimated: this.state.isFromEstimated,

                    fromToken: this.state.toToken,
                    fromInput: this.state.isToEstimated ? '' : this.state.toInput,
                    isFromEstimated: this.state.isToEstimated,
                  },
                  async () => {
                    await this.props.onSetTokens(this.state.fromToken, this.state.toToken, false);

                    this.updateInputs();
                  },
                );
              }}
            >
              <DownArrow />
            </span>
            <FlexRowSpace />
          </div>
          <SwapAssetRow
            secretjs={this.props.secretjs}
            label="To (estimated)"
            disabled={this.state.isToEstimated && this.state.loadingBestRoute}
            maxButton={false}
            balance={toBalance}
            tokens={this.props.tokens}
            token={this.state.toToken}
            setToken={async (identifier: string) => {
              await this.setToToken(identifier);
            }}
            amount={this.state.toInput}
            isEstimated={this.state.toInput !== '' /* this.state.isToEstimated */}
            setAmount={(value: string) => {
              this.setToAmount(value);
            }}
          />
          {!hidePriceRow && (
            <PriceRow
              fromToken={this.props.tokens.get(this.state.fromToken).symbol}
              toToken={this.props.tokens.get(this.state.toToken).symbol}
              price={price}
            />
          )}
          {(this.state.bestRoute || this.state.loadingBestRoute) && (
            <RouteRow
              tokens={this.props.tokens}
              isLoading={this.state.loadingBestRoute}
              loadingCount={`${this.state.loadingBestRouteCount}/${this.props.selectedPairRoutes.length}`}
              route={this.state.bestRoute}
            />
          )}
          <Button
            disabled={buttonMessage !== BUTTON_MSG_SWAP || this.state.loadingSwap}
            loading={this.state.loadingSwap}
            primary={buttonMessage === BUTTON_MSG_SWAP}
            fluid
            style={{
              margin: '1em 0 0 0',
              borderRadius: '12px',
              padding: '18px',
              fontSize: '20px',
            }}
            onClick={async () => {
              const { fromInput, fromToken, toToken, bestRoute, priceImpact, slippageTolerance } = this.state;
              const pair = this.props.selectedPair;

              this.setState({ loadingSwap: true });

              if (priceImpact >= 0.15) {
                const confirmString = 'confirm';
                const confirm = prompt(
                  `Price impact for this swap is very high. Please type the word "${confirmString}" to continue.`,
                );
                if (confirm !== confirmString) {
                  return;
                }
              }

              try {
                const { decimals } = this.props.tokens.get(fromToken);
                const fromAmount = canonicalizeBalance(new BigNumber(fromInput), decimals).toFixed(
                  0,
                  BigNumber.ROUND_DOWN,
                  /*
                  should be 0 fraction digits because of canonicalizeBalance,
                  but to be sure we're rounding down to prevent over-spending
                  */
                );

                // offer_amount: exactly how much we're sending
                // ask_amount: roughly how much we're getting
                // expected_return: at least ask_amount minus some slippage

                //const ask_amount = canonToInput;
                const expected_return = canonToInput
                  .multipliedBy(new BigNumber(1).minus(slippageTolerance))
                  .toFormat(0, { groupSeparator: '' });

                if (fromToken === 'uscrt') {
                  let result: ExecuteResult;
                  if (bestRoute) {
                    const hops = await this.getHops(bestRoute);

                    result = await this.props.secretjs.execute(
                      process.env.AMM_ROUTER_CONTRACT,
                      {
                        receive: {
                          from: this.props.secretAddress,
                          amount: fromAmount,
                          msg: btoa(
                            JSON.stringify({
                              to: this.props.secretAddress,
                              hops,
                              expected_return,
                            }),
                          ),
                        },
                      },
                      '',
                      [
                        {
                          amount: fromAmount,
                          denom: 'uscrt',
                        },
                      ],
                      getFeeForExecute(bestRoute.length * 400_000),
                    );
                  } else {
                    result = await this.props.secretjs.execute(
                      pair.contract_addr,
                      {
                        swap: {
                          offer_asset: {
                            info: { native_token: { denom: 'uscrt' } },
                            amount: fromAmount,
                          },
                          expected_return,
                          // offer_asset: Asset,
                          // expected_return: Option<Uint128>
                          // belief_price: Option<Decimal>,
                          // max_spread: Option<Decimal>,
                          // to: Option<HumanAddr>, // TODO
                        },
                      },
                      '',
                      [
                        {
                          amount: fromAmount,
                          denom: 'uscrt',
                        },
                      ],
                      getFeeForExecute(500_000),
                    );
                  }
                  storeTxResultLocally(result);

                  const sent = humanizeBalance(new BigNumber(fromAmount), fromDecimals).toFixed();
                  const received = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'return_amount', bestRoute != null)),
                    toDecimals,
                  ).toFixed();

                  this.props.notify(
                    'success',
                    `Swapped ${sent} ${this.props.tokens.get(fromToken)?.symbol} for ${received} ${
                      this.props.tokens.get(toToken).symbol
                    }`,
                  );
                } else {
                  let result: ExecuteResult;
                  if (bestRoute) {
                    const hops = await this.getHops(bestRoute);

                    result = await this.props.secretjs.execute(
                      fromToken,
                      {
                        send: {
                          recipient: process.env.AMM_ROUTER_CONTRACT,
                          amount: fromAmount,
                          msg: btoa(
                            JSON.stringify({
                              to: this.props.secretAddress,
                              hops,
                              expected_return,
                            }),
                          ),
                        },
                      },
                      '',
                      [],
                      getFeeForExecute(bestRoute.length * 400_000),
                    );
                  } else {
                    result = await this.props.secretjs.execute(
                      fromToken,
                      {
                        send: {
                          recipient: pair.contract_addr,
                          amount: fromAmount,
                          msg: btoa(
                            JSON.stringify({
                              swap: {
                                expected_return,
                                // expected_return: Option<Uint128>
                                // belief_price: Option<Decimal>,
                                // max_spread: Option<Decimal>,
                                // to: Option<HumanAddr>, // TODO
                              },
                            }),
                          ),
                        },
                      },
                      '',
                      [],
                      getFeeForExecute(500_000),
                    );
                  }

                  storeTxResultLocally(result);

                  const sent = humanizeBalance(new BigNumber(fromAmount), fromDecimals).toFixed();
                  const received = humanizeBalance(
                    new BigNumber(extractValueFromLogs(result, 'return_amount', bestRoute != null)),
                    toDecimals,
                  ).toFixed();

                  this.props.notify(
                    'success',
                    `Swapped ${sent} ${this.props.tokens.get(fromToken).symbol} for ${received} ${
                      this.props.tokens.get(toToken).symbol
                    }`,
                  );
                }
              } catch (error) {
                console.error('Swap error', error);
                this.props.notify(
                  'error',
                  `Error swapping ${fromInput} ${this.props.tokens.get(fromToken).symbol} for ${
                    this.props.tokens.get(toToken).symbol
                  }: ${error.message}`,
                );
                this.setState({
                  loadingSwap: false,
                });
                return;
              }

              this.setState({
                loadingSwap: false,
                toInput: '',
                fromInput: '',
                isFromEstimated: false,
                isToEstimated: false,
              });
            }}
          >
            {buttonMessage}
          </Button>
        </Container>
        {!hidePriceRow && (
          <AdditionalInfo
            fromToken={this.props.tokens.get(this.state.fromToken).symbol}
            toToken={this.props.tokens.get(this.state.toToken).symbol}
            liquidityProviderFee={this.state.commission * price}
            priceImpact={this.state.priceImpact}
            minimumReceived={new BigNumber(this.state.toInput).multipliedBy(
              new BigNumber(1).minus(this.state.slippageTolerance),
            )}
            pairAddress={this.props.selectedPair?.contract_addr}
            /*
            maximumSold={
              this.state.isFromEstimated
                ? Number(this.state.fromInput) *
                  (1 + this.state.slippageTolerance)
                : null
            }
            */
          />
        )}
      </>
    );
  }

  async getHops(bestRoute: string[]) {
    return (
      await Promise.all(
        bestRoute.map(async (fromToken, idx) => {
          if (idx === bestRoute.length - 1) {
            // destination token
            return null;
          }

          const hop: {
            from_token:
              | {
                  snip20: {
                    address: string;
                    code_hash: string;
                  };
                }
              | 'scrt';
            pair_address: string;
            pair_code_hash: string;
            expected_return?: string;
          } = {
            from_token: null,
            pair_address: null,
            pair_code_hash: null,
          };

          const toToken = bestRoute[idx + 1];
          const pair: SwapPair = this.props.pairs.get(`${fromToken}${SwapPair.id_delimiter}${toToken}`);

          if (fromToken === 'uscrt') {
            hop.from_token = 'scrt';
          } else {
            hop.from_token = {
              snip20: {
                address: fromToken,
                code_hash: (pair.asset_infos.find(a => (a.info as Token)?.token?.contract_addr === fromToken)
                  .info as Token).token.token_code_hash,
              },
            };
          }

          hop.pair_address = pair.contract_addr;
          hop.pair_code_hash = await SwapPair.getPairCodeHash(hop.pair_address, this.props.secretjs);

          return hop;
        }),
      )
    ).filter(x => x !== null);
  }

  private setToAmount(value: string) {
    if (value === '' || Number(value) === 0) {
      this.setState({
        toInput: value,
        isToEstimated: false,
        fromInput: '',
        isFromEstimated: false,
        spread: 0,
        commission: 0,
        priceImpact: 0,
      });
      return;
    }

    this.setState(
      {
        toInput: value,
        fromInput: '',
        isToEstimated: false,
        isFromEstimated: true,
      },
      () => this.updateInputs(),
    );
  }

  private setFromAmount = (value: string) => {
    if (value === '' || Number(value) === 0) {
      this.setState({
        fromInput: value,
        isFromEstimated: false,
        toInput: '',
        isToEstimated: false,
        spread: 0,
        commission: 0,
        priceImpact: 0,
      });
      return;
    }

    this.setState(
      {
        fromInput: value,
        toInput: '',
        isFromEstimated: false,
        isToEstimated: true,
      },
      () => this.updateInputs(),
    );
  };

  private async setToToken(identifier: string) {
    const setStateCallback = async (refreshBalances: boolean) => {
      if (refreshBalances) {
        this.setState({ loadingPriceData: true });
      }
      await this.props.onSetTokens(this.state.fromToken, this.state.toToken, refreshBalances);
      this.setState({ loadingPriceData: false });

      if (this.state.fromToken) {
        this.updateInputs();
      }
    };

    if (identifier === this.state.fromToken) {
      // switch
      this.setState(
        {
          toToken: identifier,
          fromToken: this.state.toToken,
          isFromEstimated: this.state.isToEstimated,
          isToEstimated: this.state.isFromEstimated,
          fromInput: this.state.toInput,
          toInput: this.state.fromInput,
        },
        () => setStateCallback(false),
      );
    } else {
      this.setState(
        {
          toToken: identifier,
          toInput: '',
          isToEstimated: true,
          isFromEstimated: false,
        },
        () => setStateCallback(true),
      );
    }
  }

  private async setFromToken(identifier: string) {
    const setStateCallback = async (refreshBalances: boolean) => {
      if (refreshBalances) {
        this.setState({ loadingPriceData: true });
      }

      await this.props.onSetTokens(this.state.fromToken, this.state.toToken, refreshBalances);
      this.setState({ loadingPriceData: false });

      if (this.state.toToken) {
        this.updateInputs();
      }
    };

    if (identifier === this.state.toToken) {
      // switch
      this.setState(
        {
          fromToken: identifier,
          toToken: this.state.fromToken,
          isFromEstimated: this.state.isToEstimated,
          isToEstimated: this.state.isFromEstimated,
          fromInput: this.state.toInput,
          toInput: this.state.fromInput,
        },
        () => setStateCallback(false),
      );
    } else {
      this.setState(
        {
          fromToken: identifier,
          fromInput: '',
          isFromEstimated: true,
          isToEstimated: false,
        },
        () => setStateCallback(true),
      );
    }
  }
}
