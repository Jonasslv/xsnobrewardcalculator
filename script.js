const lodash = require('lodash');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

const settings = JSON.parse(fs.readFileSync('./settings.json'));
const listStrategyContracts = JSON.parse(fs.readFileSync('./strategycontracts.json'));
const { retrievePNGPrice } = require('./src/graph.js'); 
const { Constants } = require('./src/resources.js');

async function genericQuery(pangolinAddress,limit,skip,key) {
    let query = await axios({
        url: `${Constants.covalentAPIURL}${pangolinAddress}/transactions_v2/?limit=${limit}&key=${key}&skip=${skip}&page-size=15000`,
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


console.log(Constants.snowLogo);
console.log('See the PNG harvested in all Snowglobes between 2 dates (UTC)!');
console.log('Beware that higher timeframes can take a lot of time to process.');
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
        if(starterDate > endingDate){
            console.log('Invalid date setup.'); 
            process.exit(1);   
        }
        console.log('Queries are being performed... Wait a Little.');
        searchTransactions();

    });
}

async function searchTransactions(){
    let jsonObject = new Object;
    if(settings.saveToJSON){
        jsonObject.contractList = [];
        jsonObject.starterDate = starterDate;
        jsonObject.endingDate = endingDate;
    }

    //internal function that does the covalent API query
    async function mountTransactionList(element,transactionList,skip){
        let queryResult = (await genericQuery(element.pangolinpool,Constants.standardLimit,skip,settings.covalentAPIKey)).data.data.items;
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
            console.log('Still Processing...');
            //recursive til find the date
            skip += Constants.standardSkip;
            return {result:false, list:transactionList, skip: skip};
        }
    }

    let totalPNGHarvested = 0;
    let lenList = listStrategyContracts.length;
    let counter = 0;
    console.log(`Doing Calculations between ${starterDate} and ${endingDate}`);
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
            //only successful transactions
            if(element.successful = true){
                element.log_events.forEach((element2) => {
                    //only PNG Transactions
                    if(element2.sender_address.toLowerCase() == Constants.PNGContract.toLowerCase()){
                        if(element2.decoded){
                            allDecodedEvents = allDecodedEvents.concat(element2.decoded);
                        }
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
            let validTo = false;
            let validFrom = false;
            element.params.forEach((element2) => {
                if(validTo && validFrom){
                    if(element2.name == 'value'){
                        totalPNGHarvested += (element2.value*1);
                        contractHarvested += (element2.value*1);
                    } 
                }
                if(element2.name == 'from'){
                    validFrom = (element2.value.toLowerCase() == listStrategyContracts[counter].pangolinpool.toLowerCase()); 
                }
                if(element2.name == 'to'){
                    validTo = (element2.value.toLowerCase() == listStrategyContracts[counter].strategy.toLowerCase()); 
                }
            });
        });

        if(settings.saveToJSON){
            jsonObject.contractList.push({contract:listStrategyContracts[counter].strategy,name:listStrategyContracts[counter].name,harvested:contractHarvested/10 **18});
        }
        console.log(`Contract: ${listStrategyContracts[counter].strategy} (${listStrategyContracts[counter].name}) - Harvested: ${contractHarvested/ 10 ** 18} PNG`);
        counter++;
    }while(counter <= lenList-1);

    if(settings.saveToJSON){
        jsonObject.totalPNGHarvested = totalPNGHarvested/10 **18;
        jsonObject.performanceFees = (totalPNGHarvested/10)/10 **18;
        jsonObject.xsnobRevenue = ((totalPNGHarvested/100)*3)/ 10 **18;
        fs.writeFileSync('./result.json',JSON.stringify(jsonObject));
    }

    console.log(`Total PNG Harvested: ${totalPNGHarvested/ 10 ** 18} 10% Performance Fees: ${(totalPNGHarvested/ 10 ** 18)/10} 3% xSNOB Revenue: ${((totalPNGHarvested/ 10 ** 18)/100)*3}`);
    console.log(`Total Value Harvested: $${(await retrievePNGPrice()*(totalPNGHarvested/ 10 ** 18))}`);
}
