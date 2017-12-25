'use strict';

const MYSQL = require('mysql');

class MySQLDB {
    constructor(config, options) {
        this._config = config;
        this._options = options;
        this._logger = options['logger'];
        this._conn = null;
        this._dbConfig = this._config['MYSQL_CONFIG'];
        this._tableName = 'MarketData';
        this._dbName = 'cctx';
    }
}

MySQLDB.prototype.init = function () {
    // Initialize the connection here

    this._logger.info({
        msg: 'MySQLDB:init:: Start initialization'
    });

    return new Promise((resolve, reject) => {
        this._conn = MYSQL.createConnection(this._dbConfig);
        this._conn.connect((err) => {
            if (err) {
                this._logger.info({
                    msg: 'MySQLDB:init:: Error occurred in initialization',
                    err: err
                });
                reject(err);
            } else {
                this._logger.info({
                    msg: 'MySQLDB:init:: Finished initialization'
                });
                resolve();
            }
        });
    });
};

MySQLDB.prototype.createDBIfNotExist = function () {
    return new Promise((resolve, reject) => {
        this._conn.query({
            sql: `CREATE DATABASE IF NOT EXISTS ${this._dbName}`,
            timeout: 40000 // 40 seconds
        }, function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    })
};

MySQLDB.prototype.createCoinRateTable = function () {
    return new Promise((resolve, reject) => {
        this._conn.query({
            sql: `CREATE TABLE IF NOT EXISTS ${this._dbName  + '.' + this._tableName}
            (id INT(11) NOT NULL auto_increment,
            coin VARCHAR(256) NOT NULL,
            exchange varchar(256) NOT NULL,
            updatedTime DATETIME,
            value float,
            PRIMARY KEY (id), CONSTRAINT EC_Coin UNIQUE (coin,exchange), INDEX (coin)) ENGINE=MEMORY`,
            timeout: 40000 // 40 seconds
        }, function (error, results, fields) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

MySQLDB.prototype.insertCoinData = function (data) {
    return new Promise((resolve, reject) => {
        this._conn.query(
            `INSERT INTO ${this._dbName  + '.' + this._tableName} SET ?`,
            data,
            function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        )
    });
};

// values is nothing but comma separated values of multiple items
// Examples (BTC/USD, ''bitrex', 102555522, 225), (BTC/AED, ''bitrex', 102555522, 225)
MySQLDB.prototype.bulkUpdate = function (values) {
    return new Promise((resolve, reject) => {
        this._conn.query(
            `INSERT INTO ${this._dbName  + '.' + this._tableName} (coin, exchange, updatedTime, value) VALUES ?
            ON DUPLICATE KEY UPDATE updateTime = VALUES(updateTime), value = VALUES(value) `,
            values,
            function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        )
    });
};

MySQLDB.prototype.upsert = function (value) {
    //${value['coin']}, ${value['exchange']}, ${value['updatedTime']}, ${value['value']}
    const self = this;
    return new Promise((resolve, reject) => {
        this._conn.query(
            `INSERT INTO ${this._dbName  + '.' + this._tableName}
            (coin, exchange, updatedTime, value)
            VALUES(?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE updatedTime=VALUES(updatedTime), value=VALUES(value)`,
            [value['coin'], value['exchange'], value['updatedTime'], value['value']],
            function (error, results, fields) {
                if (error) {
                    self._logger.error({
                        msg: 'MySQLDB:upsert:: Error query',
                        query: this.sql
                    });
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        )
    });
};

MySQLDB.prototype.fetchCoinRate = function (symbol) {
    return new Promise((resolve, reject) => {
        this._conn.query(
            `SELECT * FROM ${this._dbName  + '.' + this._tableName} WHERE coin = ?`,
            symbol,
            function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};

MySQLDB.prototype.fetchExchangeInfo = function (exchangeId) {
    return new Promise((resolve, reject) => {
        this._conn.query(
            `SELECT * FROM ${this._dbName  + '.' + this._tableName} WHERE exchange = ?`,
            exchangeId,
            function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
};

module.exports = MySQLDB;