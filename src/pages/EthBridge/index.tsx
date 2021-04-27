import * as React from 'react';
import { useEffect } from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { Exchange } from '../Exchange';
import { Title } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { EXCHANGE_STEPS } from 'stores/Exchange';
import { Message } from 'semantic-ui-react';
import { ISwap, ITokenInfo } from '../../stores/interfaces';

export const enum NETWORKS {
  ETH = 'ETH',
  BSC = 'BSC',
  PLSM = 'PLSM',
}

export const networkFromToken = (token: { src_network: string; dst_network?: string }): NETWORKS => {
  switch (token.src_network.toLowerCase().replace(/\s/g, '')) {
    case 'ethereum':
      return NETWORKS.ETH;
    case 'binancesmartchain':
      return NETWORKS.BSC;
    case 'plasm':
      return NETWORKS.PLSM;
    case 'secret':
      if (token?.dst_network !== 'secret') {
        return networkFromToken({ src_network: token.dst_network });
      } else {
        return undefined;
      }
    default:
      throw new Error(`Invalid network: ${token.src_network}`);
  }
};

export const EthBridge = observer((props: any) => {
  const { exchange, rewards, signerHealth, tokens } = useStores();
  //userMetamask
  //const [network, setNetwork] = useState<NETWORKS>(NETWORKS.ETH);

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();

    tokens.init(); //TODO

    signerHealth.init({});
    signerHealth.fetch();

    // if (props.match.params.token) {
    //   if ([TOKEN.NATIVE, TOKEN.ERC20].includes(props.match.params.token)) {
    //     exchange.setToken(props.match.params.token);
    //   }
    // }

    if (props.match.params.operationId) {
      exchange.setOperationId(props.match.params.operationId);
    }
  }, []);

  useEffect(() => {
    if (exchange.step === EXCHANGE_STEPS.CHECK_TRANSACTION && exchange.operation)
      exchange.fetchStatus(exchange.operation.id);
  }, [exchange.step]);

  // useEffect(() => {
  //   if (userMetamask.network) {
  //     exchange.setNetwork(userMetamask.network);
  //     exchange.setMainnet(userMetamask.mainnet);
  //     setNetwork(userMetamask.network);
  //   }
  // }, [userMetamask.network, userMetamask.mainnet, exchange]);

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" wrap={true} fill justify="between" align="start">
          <Box fill direction="column" align="center" justify="center" className={styles.base}>
            <Message info>
              <Message.Header>
                The
                <a
                  href="https://scrt.network/blog/sefi-is-live-on-mainnet"
                  style={{ textDecoration: 'none' }}
                  target="_blank"
                  rel="noreferrer"
                >
                  {' '}
                  SEFI governance token{' '}
                </a>
                is now LIVE!
              </Message.Header>
              <p>
                {'Click '}
                <a href="/sefi" style={{ textDecoration: 'underline' }} rel="noreferrer">
                  HERE
                </a>{' '}
                to claim your genesis tokens (if eligible) and to stake your SEFI and LP tokens.
              </p>
            </Message>
            <Box fill direction="row" justify="between" align="end" margin={{ bottom: 'medium', top: 'large' }}>
              <Title bold>Secret Bridge</Title>
              <WalletBalances />
            </Box>
            <Exchange />
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
