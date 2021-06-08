const lodash = require('lodash');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

const settings = JSON.parse(fs.readFileSync('./settings.json'));
const listStrategyContracts = JSON.parse(fs.readFileSync('./strategycontracts.json'));
const { retrievePNGPrice } = require('./graph.js'); 

const covalentAPIURL = `https://api.covalenthq.com/v1/43114/address/`;
const standardLimit = 1000;
const standardSkip = 1000;

async function genericQuery(pangolinAddress,limit,skip,key) {
    let query = await axios({
        url: `${covalentAPIURL}${pangolinAddress}/transactions_v2/?limit=${limit}&key=${key}&skip=${skip}&page-size=1000`,
        method: 'get'
    }).catch(error => {
        console.error(error)
    });
    return query;
}

function registerDate(date){
    if(Date.parse(date) == NaN){
        console.log('Invalid Date!');
        process.exit(1); //invalid date
    }
    return (new Date(date));
}

//test values
var starterDate;
var endingDate;


console.log('See the PNG harvested in all Snowglobes between 2 dates (UTC)!');
readStartingDate();


function readStartingDate(){
    readline.question('Input the Starter Date (yyyy-MM-dd):', date => {
        starterDate = registerDate(date);
        readEndingDate();
   });
}

function readEndingDate(){
    readline.question('Input the Ending Date (yyyy-MM-dd):', date => {
        endingDate = registerDate(date);
        readline.close();
        console.log('Queries are being performed... Wait a Little.');
        searchTransactions();

    });
}

async function searchTransactions(){
    //internal function that does the covalent API query
    async function mountTransactionList(element,transactionList,skip){
        let queryResult = (await genericQuery(element.pangolinpool,standardLimit,skip,settings.covalentAPIKey)).data.data.items;
        transactionList = transactionList.concat(queryResult);
        let existsDate = lodash.filter(transactionList,function(o) { 
            let blockDate = new Date(o.block_signed_at);
            let onlyDate = new Date(blockDate.toDateString());
            return starterDate >= onlyDate;
        });
        //dates exists or the address don't have more transactions
        if(existsDate.length > 0 || queryResult.length < 1000){
            return {result:true, list:transactionList};
        }else{
            //recursive til find the date
            skip += standardSkip;
            return {result:false, list:transactionList, skip: skip};
        }
    }

    let totalPNGHarvested = 0;
    let lenList = listStrategyContracts.length;
    let counter = 0;
    console.log(`Doing Calculations between ${starterDate} and ${endingDate}`)
    //for every snowglobe x staking pangolin pool
    do{
        let transactionsList = [];
        let listValidTransactions = [];
        var skip = 0;
        foundDate = false;
        //search all transactions loosely between 2 dates (with skip/limit)
        while(!foundDate){
            result = await mountTransactionList(listStrategyContracts[counter],transactionsList,skip);
            foundDate = result.result;
            skip = result.skip;
            transactionsList = result.list;
        }

        //enforces the 2 dates
        listValidTransactions = lodash.filter(transactionsList,function(o) { 
            let blockDate = new Date(o.block_signed_at);
            let onlyDate = new Date(blockDate.toDateString());
            return ((starterDate <= onlyDate) && (endingDate >= onlyDate));
        });

        //get only the internal transactions
        let allDecodedEvents = [];
        listValidTransactions.forEach((element)=>{
            if(element.successful = true){
                element.log_events.forEach((element2) => {
                    if(element2.decoded){
                        allDecodedEvents = allDecodedEvents.concat(element2.decoded);
                    }
                });
            }
        });
        listValidTransactions = [];
        
        //get only the transfer transactions
        let onlyTransfers = lodash.filter(allDecodedEvents,function(o) { 
            return o.name.startsWith('Transfer');
        });
        allDecodedEvents = [];

        //check if the transfer transaction was made between the strategy contract and the staking contract
        //if it's made sum the amount of PNG harvested in a variable.
        let contractHarvested = 0;
        onlyTransfers.forEach((element) => {
            let validAddress = false;
            element.params.forEach((element2) => {
                if(validAddress){
                    if(element2.name == 'value'){
                        totalPNGHarvested += (element2.value*1);
                        contractHarvested += (element2.value*1);
                    } 
                }
                if(element2.name == 'to'){
                    validAddress = (element2.value.toLowerCase() == listStrategyContracts[counter].strategy.toLowerCase()); 
                }
            });
        });

        
        console.log(`Contract: ${listStrategyContracts[counter].strategy} - Harvested: ${contractHarvested/ 10 ** 18}`);
        counter++;
    }while(counter <= lenList-1);

    console.log(`Total PNG Harvested: ${totalPNGHarvested/ 10 ** 18} 10% Performance Fees: ${(totalPNGHarvested/ 10 ** 18)/10} 3% xSNOB Revenue: ${((totalPNGHarvested/ 10 ** 18)/100)*3}`);
    console.log(`$${(await retrievePNGPrice()*(totalPNGHarvested/ 10 ** 18))}`);
}



