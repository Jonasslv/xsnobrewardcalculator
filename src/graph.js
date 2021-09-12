const axios = require('axios');
const { ethers } = require('ethers');
const { Constants } = require('./resources.js');

const JOE_LP_ABI = [{ "type": "constructor", "stateMutability": "nonpayable", "inputs": [] }, { "type": "event", "name": "Approval", "inputs": [{ "type": "address", "name": "owner", "internalType": "address", "indexed": true }, { "type": "address", "name": "spender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Burn", "inputs": [{ "type": "address", "name": "sender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "amount0", "internalType": "uint256", "indexed": false }, { "type": "uint256", "name": "amount1", "internalType": "uint256", "indexed": false }, { "type": "address", "name": "to", "internalType": "address", "indexed": true }], "anonymous": false }, { "type": "event", "name": "Mint", "inputs": [{ "type": "address", "name": "sender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "amount0", "internalType": "uint256", "indexed": false }, { "type": "uint256", "name": "amount1", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Swap", "inputs": [{ "type": "address", "name": "sender", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "amount0In", "internalType": "uint256", "indexed": false }, { "type": "uint256", "name": "amount1In", "internalType": "uint256", "indexed": false }, { "type": "uint256", "name": "amount0Out", "internalType": "uint256", "indexed": false }, { "type": "uint256", "name": "amount1Out", "internalType": "uint256", "indexed": false }, { "type": "address", "name": "to", "internalType": "address", "indexed": true }], "anonymous": false }, { "type": "event", "name": "Sync", "inputs": [{ "type": "uint112", "name": "reserve0", "internalType": "uint112", "indexed": false }, { "type": "uint112", "name": "reserve1", "internalType": "uint112", "indexed": false }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "type": "address", "name": "from", "internalType": "address", "indexed": true }, { "type": "address", "name": "to", "internalType": "address", "indexed": true }, { "type": "uint256", "name": "value", "internalType": "uint256", "indexed": false }], "anonymous": false }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "bytes32", "name": "", "internalType": "bytes32" }], "name": "DOMAIN_SEPARATOR", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "MINIMUM_LIQUIDITY", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "bytes32", "name": "", "internalType": "bytes32" }], "name": "PERMIT_TYPEHASH", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "allowance", "inputs": [{ "type": "address", "name": "", "internalType": "address" }, { "type": "address", "name": "", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "approve", "inputs": [{ "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "value", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "balanceOf", "inputs": [{ "type": "address", "name": "", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "uint256", "name": "amount0", "internalType": "uint256" }, { "type": "uint256", "name": "amount1", "internalType": "uint256" }], "name": "burn", "inputs": [{ "type": "address", "name": "to", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint8", "name": "", "internalType": "uint8" }], "name": "decimals", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "factory", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint112", "name": "_reserve0", "internalType": "uint112" }, { "type": "uint112", "name": "_reserve1", "internalType": "uint112" }, { "type": "uint32", "name": "_blockTimestampLast", "internalType": "uint32" }], "name": "getReserves", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "initialize", "inputs": [{ "type": "address", "name": "_token0", "internalType": "address" }, { "type": "address", "name": "_token1", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "kLast", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "uint256", "name": "liquidity", "internalType": "uint256" }], "name": "mint", "inputs": [{ "type": "address", "name": "to", "internalType": "address" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "name", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "nonces", "inputs": [{ "type": "address", "name": "", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "permit", "inputs": [{ "type": "address", "name": "owner", "internalType": "address" }, { "type": "address", "name": "spender", "internalType": "address" }, { "type": "uint256", "name": "value", "internalType": "uint256" }, { "type": "uint256", "name": "deadline", "internalType": "uint256" }, { "type": "uint8", "name": "v", "internalType": "uint8" }, { "type": "bytes32", "name": "r", "internalType": "bytes32" }, { "type": "bytes32", "name": "s", "internalType": "bytes32" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "price0CumulativeLast", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "price1CumulativeLast", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "skim", "inputs": [{ "type": "address", "name": "to", "internalType": "address" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "swap", "inputs": [{ "type": "uint256", "name": "amount0Out", "internalType": "uint256" }, { "type": "uint256", "name": "amount1Out", "internalType": "uint256" }, { "type": "address", "name": "to", "internalType": "address" }, { "type": "bytes", "name": "data", "internalType": "bytes" }] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "string", "name": "", "internalType": "string" }], "name": "symbol", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [], "name": "sync", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "token0", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "address", "name": "", "internalType": "address" }], "name": "token1", "inputs": [] }, { "type": "function", "stateMutability": "view", "outputs": [{ "type": "uint256", "name": "", "internalType": "uint256" }], "name": "totalSupply", "inputs": [] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transfer", "inputs": [{ "type": "address", "name": "to", "internalType": "address" }, { "type": "uint256", "name": "value", "internalType": "uint256" }] }, { "type": "function", "stateMutability": "nonpayable", "outputs": [{ "type": "bool", "name": "", "internalType": "bool" }], "name": "transferFrom", "inputs": [{ "type": "address", "name": "from", "internalType": "address" }, { "type": "address", "name": "to", "internalType": "address" }, { "type": "uint256", "name": "value", "internalType": "uint256" }] }];
const AVAXJoeLPContract = "0x454E67025631C065d3cFAD6d71E6892f74487a15";

async function genericQuery(queryObject) {
  let query = await axios({
    url: Constants.pangolinGraphAddress,
    method: 'post',
    data: {
      query: queryObject
    }
  }).catch(error => {
    console.error(error)
  });

  return new Promise(function (resolve, reject) {
    resolve(query);
  });
}

//Get AVAX Price from the USDT Pair
async function retrieveAVAXPrice() {
  let USDTQuery = await genericQuery(
    `query {
            pair(id: \"${Constants.USDTAVAXPairContract}\") {
                token1Price
            }
        }`
  );

  let DAIQuery = await genericQuery(
    `query {
            pair(id: \"${Constants.DAIAVAXPairContract}\") {
                token1Price
            }
        }`
  );

  let provider = new ethers.providers.JsonRpcProvider(Constants.RPCURL);
  let USDTPrice, DAIPrice;
  if (USDTQuery.data.data.pair) {
    USDTPrice = USDTQuery.data.data.pair.token1Price;
  } else {
    const lpContract = new ethers.Contract(Constants.USDTAVAXPairContract, JOE_LP_ABI, provider);
    const reserves = await lpContract.getReserves();
    const AVAXQt = reserves._reserve0 / 1e18;
    const USDTQt = reserves._reserve1 / 1e6;
    USDTPrice = (USDTQt / AVAXQt);
  }
  if (DAIQuery.data.data.pair) {
    DAIPrice = DAIQuery.data.data.pair.token1Price;
  } else {
    const lpContract = new ethers.Contract(Constants.DAIAVAXPairContract, JOE_LP_ABI, provider);
    const reserves = await lpContract.getReserves();
    const AVAXQt = reserves._reserve0;
    const DAIQt = reserves._reserve1;
    DAIPrice = (DAIQt / AVAXQt);
  }

  if (USDTQuery.data != undefined && DAIQuery.data != undefined) {
    //Mid-term between DAI and USDT price 
    return (USDTPrice / 2.0) + (DAIPrice / 2.0);
  }

}

const retrieveJOEPrice = async () => {
  let provider = new ethers.providers.JsonRpcProvider(Constants.RPCURL);
  const JoeAVAXPool = new ethers.Contract(AVAXJoeLPContract, JOE_LP_ABI, provider);

  //Primitive way to get Joe Price through chain before it get listed in cg or has its own graph
  const AVAXPrice = await retrieveAVAXPrice();
  const reserves = await JoeAVAXPool.getReserves();
  const JoeQt = reserves._reserve0;
  const AVAXQt = reserves._reserve1;
  return ((AVAXQt / JoeQt) * AVAXPrice);
}


async function retrieveTokenPriceInAVAX(address) {
  let result = await genericQuery(
    `query {
          token(id:"${address.toLowerCase()}") {
              id
              name
              symbol
              decimals
              derivedETH
              totalLiquidity
               tradeVolume
             }
        }
        `
  );

  if (result.data != undefined) {
    const AVAXPrice = await retrieveAVAXPrice();
    return (AVAXPrice * result.data.data.token.derivedETH).toFixed(2);
  }
}


module.exports = {
  retrieveTokenPriceInAVAX,
  retrieveJOEPrice,
  retrieveAVAXPrice,
};