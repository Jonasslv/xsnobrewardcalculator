# xSnob Reward Calculator

This Script is used for calculate all the PNG harvested in snowglobes in a given timeframe.

## Getting Started
These instructions will get a copy of the project up and running on your local machine for development and testing purposes.


### Install Prerequisites
The following dependencies are recommended to run an instance:

1. **NodeJS**
2. **Npm** 


### Obtain the Codebase
* Clone from github
    ```
    git clone https://github.com/Jonasslv/xsnobrewardcalculator.git
    ```


### Configuration
All configuration is managed inside the `settings.json` file.

In the file `strategycontracts.json` there's the contract strategy addresses and pangolin pools, if you need to add a new pool use this file.


### PNG Price
1. PNG Price is taken from pangolin the graph node.


### Deployment
1. Install project dependencies
    ```
    cd xsnobrewardcalculator
    npm install
    ```

2. Start the application
    ```
    node script.js
    ```
