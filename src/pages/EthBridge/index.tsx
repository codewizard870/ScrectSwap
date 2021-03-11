import * as React from 'react';
import { Box } from 'grommet';
import { BaseContainer, PageContainer } from 'components';
import { observer } from 'mobx-react-lite';
import { useStores } from 'stores';
import * as styles from './styles.styl';
import { Exchange } from '../Exchange';
import { EXCHANGE_MODE, TOKEN } from 'stores/interfaces';
import cn from 'classnames';
import { Text } from 'components/Base';
import { WalletBalances } from './WalletBalances';
import { useEffect, useState } from 'react';
import { BridgeHealth } from '../../components/Secret/BridgeHealthIndicator';
import { messages, messageToString } from './messages';

export const enum NETWORKS {
  ETH,
  BSC
}

const LargeButton = (props: {
  title: string;
  onClick: () => void;
  description: string;
  isActive: boolean;
  reverse?: boolean;
  network?: NETWORKS;
}) => {
  return (
    <Box
      direction="column"
      align="center"
      justify="center"
      className={cn(styles.largeButtonContainer, props.isActive ? styles.active : '')}
      onClick={props.onClick}
      gap="10px"
    >
      <BridgeHealth from_scrt={props.reverse} />
      <Box direction={props.reverse ? 'row-reverse' : 'row'} align="center">
        <Box direction="row" align="center">
          <img className={styles.imgToken} src={
            props.network ? messageToString(messages.image_logo, props.network) : '/static/eth.svg'} />
          <Text size="large" className={styles.title}>
            {props.network ? messageToString(messages.currency_symbol, props.network) : 'ETH'}
          </Text>
        </Box>
        <Box direction="row" margin={{ horizontal: 'medium' }} align="center">
          <img src="/static/right.svg" />
        </Box>
        <Box direction="row" align="center">
          <img className={styles.imgToken} src="/static/scrt.svg" />
          <Text size="large" className={styles.title}>
            Secret
          </Text>
        </Box>
      </Box>
      <Text size="xsmall" color="#748695" className={styles.description}>
        {props.description}
      </Text>
    </Box>
  );
};

export const EthBridge = observer((props: any) => {
  const { userMetamask, exchange, routing, rewards, signerHealth } = useStores();

  const [network, setNetwork] = useState<NETWORKS>(NETWORKS.ETH);

  useEffect(() => {
    rewards.init({
      isLocal: true,
      sorter: 'none',
      pollingInterval: 20000,
    });
    rewards.fetch();

    signerHealth.init({});
    signerHealth.fetch();

    if (props.match.params.token) {
      if ([TOKEN.NATIVE, TOKEN.ERC20].includes(props.match.params.token)) {
        exchange.setToken(props.match.params.token);
      } else {
        routing.push(TOKEN.NATIVE);
      }
    }

    if (props.match.params.operationId) {
      exchange.setOperationId(props.match.params.operationId);
      exchange.sendOperation(props.match.params.operationId);
    }
  }, []);

  useEffect(() => {
    if (userMetamask.network) {
      exchange.setNetwork(userMetamask.network);
      exchange.setMainnet(userMetamask.mainnet);
      setNetwork(userMetamask.network);
    }

  }, [userMetamask.network, userMetamask.mainnet, exchange])

  return (
    <BaseContainer>
      <PageContainer>
        <Box direction="row" wrap={true} fill={true} justify="between" align="start">
          <Box direction="column" align="center" justify="center" className={styles.base}>
            {/*<Box*/}
            {/*  direction="row"*/}
            {/*  justify="center"*/}
            {/*  margin={{ top: 'large' }}*/}
            {/*>*/}
            {/*  <Title size="medium" color="BlackTxt" bold>*/}
            {/*    BUSD Bridge*/}
            {/*  </Title>*/}
            {/*</Box>*/}

            <Box
              direction="row"
              justify="between"
              className={styles.swapDirectionChoice}
              margin={{ vertical: 'large' }}
            >
              <LargeButton
                title={messageToString(messages.swap_direction_source, network)}
                description="(Metamask)"
                onClick={() => exchange.setMode(EXCHANGE_MODE.TO_SCRT)}
                isActive={exchange.mode === EXCHANGE_MODE.TO_SCRT}
                network={exchange.network}
              />
              <LargeButton
                title={messageToString(messages.swap_direction_dst, network)}
                reverse={true}
                description="(Keplr)"
                onClick={() => exchange.setMode(EXCHANGE_MODE.FROM_SCRT)}
                isActive={exchange.mode === EXCHANGE_MODE.FROM_SCRT}
                network={exchange.network}
              />
            </Box>

            {/*<Box*/}
            {/*  margin={{ bottom: 'medium' }}*/}
            {/*>*/}
            {/*  <ERC20Select />*/}
            {/*</Box>*/}

            <Exchange />

            {/*<Box*/}
            {/*  className={styles.walletBalancesContainer}*/}
            {/*>*/}
            {/*  <DisableWrap disabled={!user.isAuthorized}>*/}
            {/*    <WalletBalances />*/}
            {/*  </DisableWrap>*/}
            {/*</Box>*/}
          </Box>
          <Box>
            <WalletBalances />
          </Box>
        </Box>
      </PageContainer>
    </BaseContainer>
  );
});
