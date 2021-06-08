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
                <a href="https://app.secretswap.io" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
                  {' '}
                  New SecretSwap App{' '}
                </a>
                is now LIVE!
              </Message.Header>
              <p>If you encounter any issues, you can access the legacy pages here:</p>
              <p>
                <a href="/sefi" style={{ textDecoration: 'underline' }} rel="noreferrer">
                  SEFI(v1)
                </a>
              </p>
              <p>
                <a href="/swap" style={{ textDecoration: 'underline' }} rel="noreferrer">
                  Swap(v1)
                </a>
                {/*{'Click '}*/}
                {/*<a href="/sefi" style={{ textDecoration: 'underline' }} rel="noreferrer">*/}
                {/*  HERE*/}
                {/*</a>{' '}*/}
                {/*Check it out now!*/}
              </p>
            </Message>
            {/*<Message success>*/}
            {/*  <p>No current issues </p>*/}
            {/*</Message>*/}
            <Box className={styles.headerBridge} fill margin={{ bottom: 'medium', top: 'large' }}>
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
