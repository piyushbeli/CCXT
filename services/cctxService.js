'use strict';

// system includes
const CCXT = require('ccxt');

class CCXTService {
    constructor(config, options) {
        this._config = config;
        this._options = options;
        this._logger = options['logger'];

        this._exchangeInstances = {};
    }
}

CCXTService.prototype.init = function () {
    // There is nothing to initialize for the public API but for the private API uses we might want to add the private
    // keys for various exchanges.
};

CCXTService.prototype.getExchangeInstance = function (exchangeId) {
    if (!this._exchangeInstances[exchangeId]) {
        // If exchange instance has not been created yet then do it now. We want to create only a single instance per exchange
        this._exchangeInstances[exchangeId] = new CCXT[exchangeId]();
    }
    return this._exchangeInstances[exchangeId];
};

CCXTService.prototype.getMarketData = async function (exchangeId) {
    // Lets convert the exchangeId into lowercase in case it is not passed in lowercase.
    let marketData = [];
    exchangeId = (exchangeId || '').toLowerCase();
    const exchangeInstance = this.getExchangeInstance(exchangeId);
    try {
        marketData = await exchangeInstance.fetchTickers();
        this._logger.info({
            msg: 'CCXTService:getMarketData:: Fetched the market data',
            exchangeId: exchangeId
        });
    } catch(e) {
        this._logger.error({
            msg: 'CCXTService:getMarketData:: Error occurred while fetching market data for exchange',
            echangeId: exchangeId
        });
        // Lets not throw the exception because we want to keep the process running for other exchange
    }

    return marketData;
};

module.exports = CCXTService;