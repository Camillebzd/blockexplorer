import { useEffect, useState } from 'react';

import BlockList from './BlockList'

function BlocksInfo(props) {
  const { alchemy } = props;
  const [blockNumber, setBlockNumber] = useState();
  const [lastFinalizedBlock, setLastFinalizedBlock] = useState();
  const [lastSafeBlock, setLastSafeBlock] = useState();

  useEffect(() => {
    async function getBlockNumber() {
      const blockNb = await alchemy.core.getBlockNumber();
      setBlockNumber(blockNb);
      let result = blockNb;
      while (result % 32 !== 0)
        result -= 1;
        setLastSafeBlock(result - 32); 
        setLastFinalizedBlock(result - 64); 
    }

    getBlockNumber();
  });

  return (
    <div>
      <h2>Overview</h2>
      <p>Block Number: {blockNumber}</p>
      <p>Last safe block: {lastSafeBlock}</p>
      <p>Last finalized block: {lastFinalizedBlock}</p>
      <BlockList alchemy={alchemy}/>
    </div>
  );
}

export default BlocksInfo;