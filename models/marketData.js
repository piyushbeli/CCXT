'use strict';

class MarketData {
    constructor(data, exchange) {
        if (!data) {
            return;
        }
        this.coin = data.symbol;
        this.exchange = exchange;
        this.updatedTime = new Date();
        this.value = data.last;
    }
}

module.exports = MarketData;