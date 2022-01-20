import React, { Suspense } from 'react';
import './config/base'
import { baseTheme } from 'themes';
import { GlobalStyle } from './GlobalStyle';
import { Providers } from './Providers';
import { Redirect, Route, Switch } from 'react-router-dom';
import { ActionModals } from './components/ActionModals';
import { EthBridge } from './pages/EthBridge';
// import { Explorer } from './pages/Explorer';
// import { Tokens } from './pages/Tokens';
import { SwapPageWrapper } from './pages/Swap';
import { SwapPagePool } from './pages/Pool';
import { InfoModal } from './components/InfoModal';
// import { EarnRewards } from './pages/Earn';
// import { FAQPage } from './pages/FAQ';
// import { FinancePage } from './pages/Finance';
import { SeFiPage } from './pages/SeFi';
// import { Cashback } from './pages/Cashback'
import { Governance } from 'pages/Governance';
import { CreateProposal } from 'pages/CreateProposal';
import { DetailProposal } from 'pages/DetailProposal';
import SefiStaking from 'pages/SefiStaking';
import { Migration } from 'pages/Migration';
import { BuyCrypto } from 'pages/BuyCrypto';
import './notifications.css'

export const App: React.FC = () => (
  <Providers>
    <Suspense fallback={<div />}>
      <Switch>
        <Route path="/swap" component={SwapPageWrapper} />
        <Route path="/pool" component={SwapPagePool} />
        <Route path="/earn" component={SeFiPage} />
        {/*<Route path="/cashback" component={Cashback} />*/}
        <Route path="/governance" component={Governance} />
        <Route path="/proposal/:id" component={DetailProposal} /> {/* must test this match before route with no id */}
        <Route path="/proposal" component={CreateProposal} />
        <Route path="/sefistaking" component={SefiStaking} />
        <Route path="/migration" component={Migration} />
        <Route path="/buy" component={BuyCrypto} />
        <Route path="/redir_transac" component={BuyCrypto} /> {/* todo: implement Transak data feedback */}
        {/* <Route exact path="/faq" component={FAQPage} /> */}
        {/* <Route exact path="/finance" component={FinancePage} /> */}
        {/* <Route exact path="/info" component={InfoPage} /> */}
        {/* <Route exact path="/explorer" component={Explorer} /> */}
        {/* <Route exact path="/earn" component={EarnRewards} /> */}
        {/* <Route exact path="/:token" component={EthBridge} /> */}
        <Route path="/:token/operations/:operationId" component={EthBridge} />
        <Redirect to="/swap" />
      </Switch>
    </Suspense>
    <ActionModals />
    <InfoModal />
    <GlobalStyle theme={baseTheme as any} />
  </Providers>
);
