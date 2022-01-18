import BigNumber from 'bignumber.js';
import React from 'react';
import { CosmWasmClient } from 'secretjs';
import { Container } from 'semantic-ui-react';
import { UserStoreEx } from 'stores/UserStore';
import { WithdrawLiquidityPanel } from './WithdrawLiqudityPanel';
import { TabsHeader } from './TabsHeader';
import { SwapTokenMap } from '../TokenModal/types/SwapToken';
import styles from './styles.styl';
import { PairMap } from '../TokenModal/types/SwapPair';
import Loader from 'react-loader-spinner';
import { AsyncSender } from '../../blockchain-bridge/scrt/asyncSender';
import Theme from 'themes';
import { observer } from 'mobx-react';
import Scrollbars from 'react-custom-scrollbars';

@observer
export class WithdrawTab extends React.Component<
  {
    user: UserStoreEx;
    secretjs: CosmWasmClient;
    secretjsSender: AsyncSender;
    tokens: SwapTokenMap;
    balances: { [symbol: string]: BigNumber | JSX.Element };
    pairs: PairMap;
    notify: (type: 'success' | 'error', msg: string, closesAfterMs?: number) => void;
    updateToken: CallableFunction;
    onCloseTab: CallableFunction;
    theme: Theme;
  },
  { searchText: string; isOpen: boolean }
> {
  constructor(props) {
    super(props);
  }

  state = { searchText: '', isOpen: false };
  renderThumbVertical = () => {
    return <div className={`${styles.thumb} ${styles[this.props.theme.currentTheme]}`}></div>;
  };
  setIsOpen(isRowOpen: boolean): void {
    this.setState({ isOpen: isRowOpen });
  }
  render() {
    const pairs = Array.from(new Set(this.props.pairs.values()));

    if (pairs.length === 0) {
      return (
        <Container className={`${styles.swapContainerStyle} ${styles[this.props.theme.currentTheme]}`}>
          <TabsHeader />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Loader type="ThreeDots" color="#3ba246" height="0.5em" />
          </div>
        </Container>
      );
    }

    return (
      <Container className={`${styles.swapContainerStyle} ${styles[this.props.theme.currentTheme]}`}>
        <TabsHeader />
        {pairs.length > 0 ? (
          <div style={{ display: 'flex' }}>
            <input
              autoFocus
              className={`${styles.withdrawLiquiditySearch} ${styles[this.props.theme.currentTheme]}`}
              placeholder="Search symbol or paste address"
              onChange={e => this.setState({ searchText: e.target.value.trim().toLowerCase() })}
            />
          </div>
        ) : null}
        <Scrollbars
          autoHide
          renderThumbVertical={this.renderThumbVertical}
          style={{ width: 472, height: 300 }}
          className={styles.withdrawLiquitityContent}
        >
          <div className={styles.lpTokensContainer}>
            {pairs
              .filter(p => {
                return (
                  p.contract_addr +
                  p.pair_identifier.split('/').join('') +
                  p.liquidity_token +
                  p.asset_infos[0].symbol +
                  p.asset_infos[1].symbol
                )
                  .toLowerCase()
                  .includes(this.state.searchText);
              })
              .sort((p1, p2) => {
                let [p1SymbolA, p1SymbolB] = [p1.asset_infos[0].symbol, p1.asset_infos[1].symbol];
                p1SymbolA = p1SymbolA.replace(/^s/, '');
                p1SymbolB = p1SymbolB.replace(/^s/, '');
                let p1Symbol = `${p1SymbolA}-${p1SymbolB}`;
                if (p1SymbolB === 'SCRT') {
                  p1Symbol = `${p1SymbolB}-${p1SymbolA}`;
                }

                let [p2SymbolA, p2SymbolB] = [p2.asset_infos[0].symbol, p2.asset_infos[1].symbol];
                p2SymbolA = p2SymbolA.replace(/^s/, '');
                p2SymbolB = p2SymbolB.replace(/^s/, '');
                let p2Symbol = `${p2SymbolA}-${p2SymbolB}`;
                if (p2SymbolB === 'SCRT') {
                  p2Symbol = `${p2SymbolB}-${p2SymbolA}`;
                }

                if (p1Symbol.startsWith('SCRT-') && !p2Symbol.startsWith('SCRT-')) {
                  return -1;
                }
                if (p2Symbol.startsWith('SCRT-') && !p1Symbol.startsWith('SCRT-')) {
                  return 1;
                }

                return p1Symbol.localeCompare(p2Symbol);
              })
              .map(p => {
                return (
                  <span key={p.lpTokenSymbol()}>
                    <WithdrawLiquidityPanel
                      tokens={this.props.tokens}
                      secretjsSender={this.props.secretjsSender}
                      selectedPair={p}
                      balances={this.props.balances}
                      secretjs={this.props.secretjs}
                      notify={this.props.notify}
                      getBalance={this.props.updateToken}
                      onCloseTab={this.props.onCloseTab}
                      theme={this.props.theme}
                      isRowOpen={this.state.isOpen}
                      setIsRowOpen={(isOpen: boolean) => {
                        this.setIsOpen(isOpen);
                      }}
                    />
                  </span>
                );
              })}
          </div>
        </Scrollbars>
      </Container>
    );
  }
}
