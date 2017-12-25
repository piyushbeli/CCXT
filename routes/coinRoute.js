'use strict';

// System includes
const EXPRESS = require('express');

// Local includes
const UTILS = require(__dirname + '/../utils/utils');
const COIN_SERVICE = require(__dirname + '/../services/coinService');

class CoinRoute {
    constructor(config, options) {
        this._config = config;
        this._options = options;
        this._logger = options['logger'];

        this._router = EXPRESS.Router();
        this._coinService = new COIN_SERVICE(config, options);


        // Define various coin routes
        this._router.get('/coin-price', this.fetchCoinPrice.bind(this));
        this._router.get('/exchange-info', this.fetchExchangeInfo.bind(this));
    }
}

CoinRoute.prototype.init = async function () {
    await this._coinService.init();
    this._logger.info({
        msg: 'CoinRoute:init:: Start initialization'
    });
};

CoinRoute.prototype.getRouter = function() {
    return this._router;
};

// Fetch the coin pair price
// Example: http://localhost:9001/coin/coin-price?pair=XRP/USDT
CoinRoute.prototype.fetchCoinPrice = async function (req, res) {
    const coinPair = req.query['pair'];

    if (!coinPair) {
        UTILS.writeError(res, 'pair name is not passed', 404);
    } else {
        const data = await this._coinService.getCoinRates(coinPair);
        UTILS.writeSuccess(res, data);
    }
};

// Fetch the exchange info
// Example http://localhost:9001/coin/coin-price?pair=XRP/USDT
CoinRoute.prototype.fetchExchangeInfo = async function (req, res) {
    const exchangeId = req.query['name'];
    const isValidExchange = this._config['SUPPORTED_EXCHANGE'].indexOf(exchangeId) > -1;

    if (!exchangeId) {
        UTILS.writeError(res, 'exchange name is not passed', 504);
    } else if (!isValidExchange) {
        UTILS.writeError(res, `exchange ${exchangeId} is not supported`, 404);
    } else {
        const data = await this._coinService.getExchangeData(exchangeId);
        UTILS.writeSuccess(res, data);
    }
};

module.exports = CoinRoute;