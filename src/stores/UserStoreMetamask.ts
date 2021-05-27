import { action, observable } from 'mobx';
import { statusFetching } from '../constants';
import detectEthereumProvider from '@metamask/detect-provider';
import { StoreConstructor } from './core/StoreConstructor';
import * as contract from '../blockchain-bridge';
import { getErc20Balance, getEthBalance } from '../blockchain-bridge';
import { divDecimals, sleep } from '../utils';
import Web3 from 'web3';
import { IOperation, TOKEN } from './interfaces';
import { networkFromToken, NETWORKS } from '../pages/EthBridge';
import { messages, messageToString } from '../pages/EthBridge/messages';
import * as agent from 'superagent';

const defaults = {};

interface ConnectInfo {
  chainId: string;
}
interface NetworkProps {
  mainnet: boolean;
  network: NETWORKS;
}

const chainIdMap: Record<string, NetworkProps> = {
  '0x1': { mainnet: true, network: NETWORKS.ETH },
  '0x2': { mainnet: false, network: NETWORKS.ETH },
  '0x3': { mainnet: false, network: NETWORKS.ETH },
  '0x4': { mainnet: false, network: NETWORKS.ETH },
  '0x5': { mainnet: false, network: NETWORKS.ETH },
  '0x2a': { mainnet: false, network: NETWORKS.ETH },
  '0x38': { mainnet: true, network: NETWORKS.BSC },
  '0x61': { mainnet: false, network: NETWORKS.BSC },
  '0x50': { mainnet: false, network: NETWORKS.PLSM },
};

export interface IERC20Token {
  name: string;
  symbol: string;
  decimals: string;
  erc20Address: string;
}

export class UserStoreMetamask extends StoreConstructor {
  @observable public isAuthorized: boolean;
  @observable error: string = '';

  @observable public chainId: string;
  @observable public network: NETWORKS;

  @observable public mainnet: boolean;

  public status: statusFetching;
  public balancesLoading: boolean = false;
  @observable public isMetaMask = false;
  private provider: any;

  @observable public chainName: string;
  @observable public ethAddress: string;
  @observable public nativeBalance: string = '';
  @observable public nativeBalanceMin: string = '';
  @observable public balanceToken: { [key: string]: string } = {};
  @observable public balanceTokenMin: { [key: string]: string } = {};
  @observable public rates: Record<NETWORKS, number>;

  @observable erc20Address: string = '';
  @observable erc20TokenDetails: IERC20Token;
  @observable erc20Balance: string = '';
  @observable erc20BalanceMin: string = '';

  constructor(stores) {
    super(stores);

    const session = localStorage.getItem('metamask_session');

    const sessionObj = JSON.parse(session);

    if (sessionObj && sessionObj.ethAddress) {
      this.signIn();
    }

    if (sessionObj && sessionObj.erc20Address) {
      this.setToken(sessionObj.erc20Address);
    }
    this.getRates();
    this.getBalances();
    setInterval(() => {
      this.getRates();
      this.getBalances();
    }, 5000);
  }

  @action.bound
  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      return this.setError('Please connect to MetaMask');
    } else {
      this.ethAddress = Web3.utils.toChecksumAddress(accounts[0]);
      this.syncLocalStorage();
    }
    this.getBalances();
  }

  @action public async getRates() {
    console.log('got rates');
    this.rates = Object.assign(
      {},
      ...this.stores.tokens.allData
        .filter(token => token.src_address === 'native')
        .map(token => {
          let network = networkFromToken(token);
          return {
            [network]: Number(token.price),
          };
        }),
    );

    if (isNaN(this.rates.BSC) || this.rates.BSC === 0) {
      const bnbUSDT = await agent.get<{ body: IOperation }>(
        'https://api.binance.com/api/v1/ticker/24hr?symbol=BNBUSDT',
      );
      this.rates.BSC = bnbUSDT.body.lastPrice;
    }
    if (isNaN(this.rates.ETH) || this.rates.ETH === 0) {
      const ethusdt = await agent.get<{ body: IOperation }>(
        'https://api.binance.com/api/v1/ticker/24hr?symbol=ETHUSDT',
      );
      this.rates.ETH = ethusdt.body.lastPrice;
    }
  }

  getNetworkPrice() {
    return this.rates[this.network];
  }

  getCurrencySymbol() {
    return messageToString(messages.currency_symbol, this.network || NETWORKS.ETH);
  }

  getNetworkFullName() {
    return messageToString(messages.full_name, this.network || NETWORKS.ETH);
  }

  getNetworkImage() {
    return messageToString(messages.image_logo, this.network || NETWORKS.ETH);
  }

  getNativeDecimals() {
    return messageToString(messages.decimals, this.network || NETWORKS.ETH);
  }

  getNetworkName(id: string) {
    switch (id) {
      case '0x1':
        return 'mainnet';
      case '0x2a':
        return 'kovan';
      case '0x3':
        return 'ropsten';
      case '0x4':
        return 'rinkeby';
      case '0x38':
        return 'BSC Mainnet';
      case '0x61':
        return 'BSC Testnet';
      case '0x50':
        return 'Plasm Testnet';
      default:
        return '';
    }
  }

  isCorrectNetworkSelected() {
    if (process.env.ENV === 'MAINNET') {
      return chainIdMap[this.chainId].mainnet && chainIdMap[this.chainId].network === this.network;
    }

    if (process.env.ENV === 'TESTNET') {
      return !chainIdMap[this.chainId].mainnet && chainIdMap[this.chainId].network === this.network;
    }

    return false;
  }

  @action.bound
  setError(error: string) {
    this.error = error;
    this.isAuthorized = false;
  }

  @action.bound
  public async signOut() {
    this.isAuthorized = false;
    this.nativeBalance = '';
    this.nativeBalanceMin = '';
    this.ethAddress = '';
    this.balanceToken = {};

    this.syncLocalStorage();
  }

  @action.bound
  public async signIn(isNew = false) {
    try {
      this.error = '';

      const provider = await detectEthereumProvider();

      // @ts-ignore
      if (provider !== window.ethereum) {
        console.error('Do you have multiple wallets installed?');
      }

      // @ts-ignore
      const chainId = await provider.request({ method: 'eth_chainId' });
      this.chainName = this.getNetworkName(chainId);

      // @ts-ignore
      provider.on('chainChanged', chainId => {
        this.chainName = this.getNetworkName(chainId);
        this.setNetworkFromChainId(chainId);
      });

      if (!provider) {
        return this.setError('Metamask not found');
      }

      this.provider = provider;

      if (this.provider.chainId) {
        this.setNetworkFromChainId(this.provider.chainId);
      }

      this.provider.autoRefreshOnNetworkChange = false;

      this.provider.on('accountsChanged', this.handleAccountsChanged);

      this.provider.on('connect', async (connectInfo: ConnectInfo) => {
        this.isAuthorized = true;
        const params = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        this.handleAccountsChanged(params);
        this.setNetworkFromChainId(connectInfo.chainId);
      });

      this.provider.on('disconnect', () => {
        this.isAuthorized = false;
        this.ethAddress = null;
      });

      try {
        if (isNew) {
          await new Promise((accept, reject) =>
            this.provider.send(
              {
                method: 'wallet_requestPermissions',
                params: [
                  {
                    eth_accounts: {},
                  },
                ],
              },
              err => (err ? reject(err) : accept('success')),
            ),
          );
        }

        this.isAuthorized = true;

        const params = await this.provider.request({
          method: 'eth_requestAccounts',
        });
        this.handleAccountsChanged(params);
      } catch (err) {
        if (err.code === 4001) {
          this.isAuthorized = false;
          this.ethAddress = null;
          this.syncLocalStorage();
          return this.setError('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      }
    } catch (e) {
      return this.setError(e.message);
    }
  }

  @action.bound
  setNetwork(network: NETWORKS) {
    this.network = network;
  }

  @action.bound
  private setNetworkFromChainId(chainId: string) {
    this.chainId = chainId;

    try {
      this.network = chainIdMap[chainId].network;
      this.mainnet = chainIdMap[chainId].mainnet;
    } catch (e) {
      console.error('Unknown chain ID, defaulting to ETH');
      this.network = NETWORKS.ETH;
    }
  }

  private syncLocalStorage() {
    localStorage.setItem(
      'metamask_session',
      JSON.stringify({
        ethAddress: this.ethAddress,
        erc20Address: this.erc20Address,
      }),
    );
  }

  @action.bound public getBalances = async () => {
    if (!this.ethAddress) return;

    this.balancesLoading = true;

    while (this.stores.tokens.isPending) {
      await sleep(50);
    }
    // always load native balance, because why not? And this bypasses race conditions with this.stores.tokens
    this.nativeBalance = await getEthBalance(this.ethAddress);
    this.nativeBalanceMin = this.balanceTokenMin[this.getNetworkFullName()];

    for (const token of this.stores.tokens.allData) {
      if (token.src_address === 'native') {
        continue;
      }
      getErc20Balance(this.ethAddress, token.src_address).then(b => {
        this.balanceToken[token.src_coin] = b;
        //console.log(`hello from ${token.display_props.symbol} - ${JSON.stringify(this.balanceToken[token.src_coin])}`)
      });
      this.balanceTokenMin[token.src_coin] = token.display_props.min_to_scrt;
    }

    this.balancesLoading = false;
  };

  @action.bound public setToken = async (erc20Address: string, tokens?) => {
    this.erc20TokenDetails = null;
    this.erc20Address = '';
    this.erc20Balance = '';
    this.erc20BalanceMin = '';
    this.stores.user.snip20Address = '';
    this.stores.user.snip20Balance = '';
    this.stores.user.snip20BalanceMin = '';

    this.erc20TokenDetails = await contract.fromScrtMethods[this.network][TOKEN.ERC20].tokenDetails(erc20Address);

    this.erc20Address = erc20Address;
    this.erc20Balance = divDecimals(
      await getErc20Balance(this.ethAddress, erc20Address),
      this.erc20TokenDetails.decimals,
    );

    this.erc20BalanceMin = this.stores.tokens.allData.find(
      t => t.src_address === erc20Address,
    ).display_props.min_to_scrt;

    if (tokens) {
      const token = tokens.allData.find(t => t.src_address === this.erc20Address);
      if (token.dst_address) {
        await this.stores.user.updateBalanceForSymbol(token.display_props.symbol);

        this.stores.user.snip20Address = token.dst_address;
        this.stores.user.snip20Balance = this.stores.user.balanceToken[token.src_coin];
        this.stores.user.snip20BalanceMin = this.stores.user.balanceTokenMin[token.src_coin];
      }
    }
  };

  @action public reset() {
    Object.assign(this, defaults);
  }
}
