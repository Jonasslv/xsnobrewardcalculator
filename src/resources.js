const snowglobesLogo = 
' _____                           __      __\n'+
'/ ___/____  ____ _      ______ _/ /___  / /_  ___  _____\n'+
'\\__ \\/ __ \\/ __ \\ | /| / / __ `/ / __ \\/ __ \\/ _ \\/ ___/\n'+
' _/ / / / / /_/ / |/ |/ / /_/ / / /_/ / /_/ / __(__  )\n'+
'/____/_/ /\\____/|__/|__/\__,  /_/\_____/_.___/\___/____/\n'+
'   ______      __     /____/__      __\n'+
'  / ____/___ _/ /______  __/ /___ _/ /_____  _____\n'+
' / /   / __ `/ / ___/ / / / / __ `/ __/ __ \\/ ___/\n'+
'/ /___/ /_/ / / /__/ /_/ / / /_/ / /_/ /_/ / /\n'+
'\\____/\\__,_/_/\\___/\\__,_/_/\\__,_/\\__/\\____/_/\n';
                                                        


module.exports = {
    Constants: class {
        static pangolinGraphAddress = "https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex";
        static USDTAVAXPairContract = "0x9ee0a4e21bd333a6bb2ab298194320b8daa26516";
        static DAIAVAXPairContract = "0x17a2e8275792b4616befb02eb9ae699aa0dcb94b";
        static PNGContract = "0x60781c2586d68229fde47564546784ab3faca982";
        static JoeContract = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd";
        static ZeroAddress = "0x0000000000000000000000000000000000000000";
        static covalentAPIURL = `https://api.covalenthq.com/v1/43114/address/`;
        static standardLimit = 1000;
        static snowLogo = snowglobesLogo;
    }
}





