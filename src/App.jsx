import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { RequestAirdrop } from './components/RequestAirdrop';
import WalletContextProvider from './context/WalletContextProvider';
import SendSol from './components/SendSol';
import Realm from './components/Realm';
import './App.css';

import '@solana/wallet-adapter-react-ui/styles.css';

const App = () => {
  return (
    <WalletContextProvider>
      <WalletMultiButton />
      <RequestAirdrop />
      <SendSol />
      <Realm/>
    </WalletContextProvider>
  );
};

export default App;
