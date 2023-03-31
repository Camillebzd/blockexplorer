// const { default: axios } = require("axios");
// const { ethers } = require("ethers");
import { ethers } from "ethers/lib";
import axios from 'axios';

const ALCHEMY_API_URL = process.env.REACT_APP_MAINNET_API_URL;

const getBlockReward = async blockNum => {
  const getBlock = async num => {
    console.log(num)
    const blockNumHex = ethers.utils.hexlify(num);
    const blockRes = await axios.post(ALCHEMY_API_URL, {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: [blockNumHex, true],
      id: 0,
    });
    return blockRes.data.result;
  };

  const getGasUsage = async hash => {
    const txRes = await axios.post(ALCHEMY_API_URL, {
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [`${hash}`],
      id: 0,
    });
    return txRes.data.result.gasUsed;
  };

  const getUncle = async hash => {
    const uncleRes = await axios.post(ALCHEMY_API_URL, {
      jsonrpc: "2.0",
      method: "eth_getBlockByHash",
      params: [`${hash}`, false],
      id: 0,
    });
    return uncleRes.data.result;
  };

  try {
    console.log("fetching block rewards...");
    const block = await getBlock(blockNum);
    const blockNumber = parseInt(block.number);
    const transactions = block.transactions;
    const baseFeePerGas = block.baseFeePerGas;
    const gasUsed = block.gasUsed;

    let minerTips = [];
    let sumMinerTips = 0;
    for (const tx of transactions) {
      const txGasUseage = await getGasUsage(tx.hash);
      const totalFee = ethers.utils.formatEther(
        ethers.BigNumber.from(txGasUseage).mul(tx.gasPrice).toString()
      );
      minerTips.push(Number(totalFee));
    }

    if (transactions.length > 0) {
      sumMinerTips = minerTips.reduce(
        (prevTip, currentTip) => prevTip + currentTip
      );
    }

    const burnedFee = ethers.utils.formatEther(
      ethers.BigNumber.from(gasUsed).mul(baseFeePerGas).toString()
    );

    const baseBlockReward = 2;
    const nephewReward = baseBlockReward / 32;
    const uncleCount = block.uncles.length;
    const totalNephewReward = uncleCount * nephewReward;

    let uncleRewardsArr = [];
    for (const hash of block.uncles) {
      const uncle = await getUncle(hash);
      if (uncle == null)
        break;
      const uncleNum = parseInt(uncle.number);
      const uncleMiner = uncle.miner;
      const uncleReward = ((uncleNum + 8 - blockNumber) * baseBlockReward) / 8;
      uncleRewardsArr.push({
        reward: `${uncleReward}ETH`,
        miner: uncleMiner,
      });
    }

    const blockReward = baseBlockReward + (sumMinerTips - Number(burnedFee));

    if (uncleCount > 0) {
      console.log("Block reward:", blockReward + totalNephewReward + "ETH");
      console.log("miner:", block.miner);
      console.log("Uncle rewards:");
      console.log(uncleRewardsArr);
      return (blockReward + totalNephewReward + "ETH");
    } else {
      console.log("Block reward:", blockReward + "ETH");
      console.log("miner:", block.miner);
      return (blockReward + "ETH");
    }
  } catch (error) {
    console.log(error);
  }
};

export default getBlockReward;