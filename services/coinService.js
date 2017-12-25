'use strict';

const _ = require('lodash');

class CoinService {
    constructor(config, options) {
        this._config = config;
        this._options = options;

        this._logger= options['logger'];
        this._mysql = options['mysql'];
    }
}

CoinService.prototype.init = function () {

};

CoinService.prototype.getExchangeData = async function (exchangeId) {
    let exchangeData = await this._mysql.fetchExchangeInfo(exchangeId);
    let result = [];
    // Only send coin and value.
    for (let d of exchangeData) {
        d = _.pick(d, ['coin', 'value']);
        result.push(d);
    }
    return result;
};

CoinService.prototype.getCoinRates = async function (coinPair) {
    const coinRates = await this._mysql.fetchCoinRate(coinPair);
    return coinRates;
};

module.exports = CoinService;