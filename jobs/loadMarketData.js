'use strict';

// Local includes
const CCTXService = require(__dirname + '/../services/cctxService');
const MarketData = require(__dirname + '/../models/marketData');

class LoadMarketData {
    constructor(config, options) {
        this._config = config;
        this._options = options;

        this._logger = options['logger'];
        this._mysql = options['mysql'];

        this._cctxService = new CCTXService(this._config, this._options);;
    }
}

LoadMarketData.prototype.init = async function () {   
    await this._cctxService.init();
};

LoadMarketData.prototype.start = async function () {
    // There is no need to use the cron job as this job needs to run in the loop after a fixed time.
    // Native setInterval is enough and better to use in this condition.
    const self = this;
    // Let us first fulfill the requirement to load the data into mysql db.
    await this._fulfillDBRequirements();
    setInterval(function () {
        self.run();
    }, this._config['CRON_FREQUENCY']);

    // Manually start the job for the first time.
     this.run();
};

LoadMarketData.prototype.run = async function () {
    try {
        // Load the bittrex and poloniex market data
        const result = await Promise.all([this._cctxService.getMarketData('bittrex'), this._cctxService.getMarketData('poloniex')]);

        // Insert bittrex market data into the MySQL table
        const bittrexData = result[0];
        let allMarketData = [];
        //Lets filter only those properties which are needed to store in the DB.
        for (let i in bittrexData) {
            let marketData = new MarketData(bittrexData[i], this._options['EXCHANGE_NAMES']['BITTREX']);
            allMarketData.push(marketData);
        }

        // Insert poloniex market data into MySQL table
        const poloniexData = result[1];
        //Lets filter only those properties which are needed to store in the DB.
        for (let i in poloniexData) {
            let marketData = new MarketData(poloniexData[i], this._options['EXCHANGE_NAMES']['POLONIEX']);
            allMarketData.push(marketData);
        }
        //this._mysql.bulkUpdate(allMarketData);
        for (let marketData of allMarketData) {
            // Issue the insert command here. It will be actually upsert command rather than insert
            await this._mysql.upsert(marketData);
        }
        this._logger.info({
            msg: 'LoadMarketData:run:: Finished inserting thw data into mysql db',
            totalUpserted: allMarketData.length
        });
    } catch (e) {
        this._logger.error({
            msg: 'LoadMarketData:run:: Error occurred while fetching the market data',
            err: e.toString()
        });
    }
};

LoadMarketData.prototype._fulfillDBRequirements = async function () {
    // First create the DB if it does not exist.
    await this._mysql.createDBIfNotExist();
    await this._mysql.createCoinRateTable();
};

module.exports = LoadMarketData;
