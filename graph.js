const axios = require('axios');
const lodash = require('lodash');
const { Constants } = require('./resources.js');

var AVAXValue;

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

    return new Promise( function(resolve,reject){
        resolve(query);
    }); 
}

//Get AVAX Price from the USDT Pair
async function retrieveAVAXPrice(){
    let USDTPrice = await genericQuery(
        `query {
            pair(id: \"${Constants.USDTAVAXPairContract}\") {
                token1Price
            }
        }`
    );

    let DAIPrice = await genericQuery(
        `query {
            pair(id: \"${Constants.DAIAVAXPairContract}\") {
                token1Price
            }
        }`
    );

    if (USDTPrice.data != undefined && DAIPrice.data != undefined) {
        //Mid-term between DAI and USDT price 
        AVAXValue = (USDTPrice.data.data.pair.token1Price/2.0)+(DAIPrice.data.data.pair.token1Price/2.0);
    }

}


async function retrievePNGPrice() {
    let result = await genericQuery(
        `query {
            tokens(first: 100, orderBy:  tradeVolumeUSD orderDirection:desc) {
                id
                name
                symbol
                decimals
                derivedETH
                totalLiquidity
                tradeVolume
            }
        }`
    );

    if (result.data != undefined) {
        await retrieveAVAXPrice();

        //update bot presence
        let filteredResult = lodash.filter(result.data.data.tokens, { "symbol": "PNG" });
        let orderedResult =  lodash.orderBy(filteredResult,["totalLiquidity", "tradeVolume"], ['desc', 'desc']);
        return (AVAXValue * orderedResult[0].derivedETH).toFixed(2);
    }
}


module.exports = {
    retrievePNGPrice: retrievePNGPrice
};