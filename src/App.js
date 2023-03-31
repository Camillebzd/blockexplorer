import { Alchemy, Network } from 'alchemy-sdk';
import BlocksInfo from './components/BlocksInfo';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

function App() {

  return (
    <div className="App">
      <h1>Block explorer</h1>
      <BlocksInfo alchemy={alchemy} />
    </div>
  );
}

export default App;
