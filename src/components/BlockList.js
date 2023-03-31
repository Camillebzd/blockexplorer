import { useEffect, useState } from 'react';

import { BiCube } from "react-icons/bi";
import './BlockList.css'
import getBlockReward from '../utils/GetBlockReward';

function BlockList(props) {
  const { alchemy } = props;
  const [last5Blocks, setLast5Blocks] = useState([]);
  const [blockRewards, setBlockRewards] = useState(new Map());
  const addBlockRewards = (key, value) => {
    setBlockRewards(map => new Map(map.set(key, value)));
  }
  const removeBlockRewards = (key) => {
    setBlockRewards(map => new Map(map.delete(key)));
  }


  useEffect(() => {
    async function getlast5Blocks() {
      const blockNb = await alchemy.core.getBlockNumber();
      let blocks = [];

      for (let i = 0; i < 5; i++) {
        const newBlock = await alchemy.core.getBlockWithTransactions(blockNb - i);
        if (newBlock != null) {
          blocks.push(newBlock);
        }
      }
      // console.log(blocks[0]);
      setLast5Blocks(blocks);
    }

    getlast5Blocks();
  });

  useEffect(() => {
    async function getLast5BlockRewards() {
      for (let block of last5Blocks) {
        if (!blockRewards.has(block.number)) {
          const blockRwd = await getBlockReward(block.number);
          addBlockRewards(block.number, blockRwd);
        }
      }
    }
    getLast5BlockRewards();
  }, [last5Blocks, blockRewards]);

  const list = () => {
    return (
      <div>
        {last5Blocks.map((block, i) => {
          const nowDate = new Date();
          const minedDate = new Date(block.timestamp * 1000);
          if (block === undefined) {
            return (<div>loading...</div>)
          }
          return (
            <div className="Block">
              <div className="Block-left-side">
                <BiCube size='50px' />
                <div >
                  <p>{block.number}</p>
                  <p>{Math.round((nowDate.getTime() - minedDate.getTime()) / 1000)} secs ago</p>
                </div>
              </div>
              <div>
                <p>Fee Recipient {block.miner.slice(0, 6)}...{block.miner.slice(-6)}</p>
                <p>{block.transactions.length} txns in 12 secs</p>
              </div>
                {blockRewards.get(block.number) !== undefined ? blockRewards.get(block.number) : "loading..."}
            </div>
          );
        })}
      </div>
    )
    
  }

  return (
    <div>
      <h2>Latest Blocks</h2>
      {last5Blocks.length !== 5 ? <p>Loading blocks...</p> : list()}
    </div>
  );
}



export default BlockList;