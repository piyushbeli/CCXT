'use strict';

// System includes
const EXPRESS     = require('express');

class CoinRoute {
    constructor(config, options) {
        this._config = config;
        this._options = options;
        this._logger = options['logger'];

        this._router = EXPRESS.Router();


        // Define various coin routes
        this._router.get('/coin-price', this.fetchCoinPrice.bind(this));
        this._router.get('/exchange-info', this.fetchExchangeInfo.bind(this));
    }
}

CoinRoute.prototype.init = function () {
    this._logger.info({
        msg: 'CoinRoute:init:: Start initialization'
    });
};

CoinRoute.prototype.getRouter                    = function() {
    return this._router;
};

// Fetch the coin pair price
CoinRoute.prototype.fetchCoinPrice = function (req, res) {

};

// Fetch the exchange info
CoinRoute.prototype.fetchExchangeInfo = function (req, res) {

};

module.exports = CoinRoute;