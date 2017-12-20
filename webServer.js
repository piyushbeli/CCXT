//
// Express based web server. Initial landing point. It routes traffics appropriately.
//

// System includes
const BODY_PARSER = require('body-parser'),
    EVENTS = require('events'),
    EXPRESS = require('express'),
    EXTEND = require('extend'),
    HTTP = require('http'),
    UTIL = require('util');

// Local includes
const CONSTANTS = require(__dirname + '/utils/constants.js'),
      MYSQL = require(__dirname + '/services/mysql.js'),
      UTILS = require(__dirname + '/utils/utils');

// Various routers
const COIN_ROUTES = require(__dirname + '/routes/coinRoute.js');

// Various service and jobs
const LoadMarketData = require(__dirname + '/./jobs/loadMarketData');

class WebServer {
    constructor(config, options) {
        // Do all kinds of checks on params and their contents
        if (!config || !options)
            throw new Error('PiyushTest::constructor::Bad params');

        EVENTS.EventEmitter.call(this);

        if (!config['HTTP_PORT'])
            throw new Error('PiyushTest.constructor::Port is not specified');

        this._config = config;

        this._options = options || {};

        this._logger = this._options['logger'];

        this._httpServer = null;

        this._upTime = Date.now();

        this._mysql = new MYSQL(this._config, this._options);

        this._options['mysql'] = this._mysql;

        //Copy all the constants into options
        EXTEND(true, this._options, CONSTANTS);

        // Various routers
        this._coinRoute = new COIN_ROUTES(this._config, this._options);

        // Initialize the job to fetch the market data
        this._loadMarketDataJob = new LoadMarketData(this._config, this._options);
    }
}

UTIL.inherits(WebServer, EVENTS.EventEmitter);

WebServer.prototype.start = async function () {
    var self = this,
        app = EXPRESS();

    this._httpServer = HTTP.createServer(app);

    this._log('info', null, null, {
        message: 'PiyushTest.start::Starting HTTP web server',
        port: this._config['HTTP_PORT']
    });

    //
    // Request handlers
    //
    // We log all requests, helping in debugging
    app.use(this._requestLogger.bind(this));

    // Handle all errors on req/res object
    app.use(this._errorHandler.bind(this));

    // A special URL to get the heartbeat of the server
    app.use('/heartbeat', this._provideHeartBeat.bind(this));

    //Add body parser here not above this, because this is place our actual routes start
    app.use(BODY_PARSER.json());
    app.use(BODY_PARSER.urlencoded({extended: false}));

    app.use('/coin', this._coinRoute.getRouter());

    //
    // Response modifiers
    //
    app.use(this._catchAll.bind(this));
    app.disable('x-powered-by');


    try {
        await this._mysql.init();
        await this._coinRoute.init();
        await this._loadMarketDataJob.init();
        this._loadMarketDataJob.start();
        this._httpServer.listen(this._config['HTTP_PORT']);
        this.emit('start');
    } catch (e) {
        this._log('error', {
            msg: 'WebServer: start:: error occurred in starting the webserver',
            err: e.toString()
        });
        throw e;
    }
};

WebServer.prototype._requestLogger = function (req, res, next) {
    var startTime = Date.now(),
        endTime,
        timeTaken;
    this._log('debug', req, res, {
        message: 'WebServer._requestLogger::Request',
        method: req.method,
        url: req.originalUrl
    });

    // Override 'end' so that we can print some debugging messages
    var end = res.end;
    res.end = function (chunk, encoding) {
        res.end = end;
        res.end(chunk, encoding);

        endTime = Date.now();
        timeTaken = endTime - startTime;
        this._log('debug', req, res, {
            message: 'WebServer._requestLogger::Response',
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            timeTaken: timeTaken + ' ms'
        });

        //
        // Log any response headers that we want to log
        //

    }.bind(this);

    next();
};

WebServer.prototype._errorHandler = function (req, res, next) {
    var self = this;
    req.on('error', function (err) {
        self._log('warn', req, res, {
            message: 'WebServer._errorHandler::Request error',
            error: err
        });
        // Send some error back to the client
        res.send('Internal error, please inform Zippia at support@zippia.com');
        res.end();
    });

    res.on('error', function (err) {
        self._log('warn', req, res, {
            message: 'WebServer._errorHandler::Response error',
            error: err
        });
        // Can't really do much in terms of informing the client
    });

    next();
};

WebServer.prototype._provideHeartBeat = function (req, res, next) {
    try {
        var data = {
            upTime: this._upTime,
            currentTime: Date.now(),
            stats: {}
        };
        res.status(200).type('txt');
        res.send(
            JSON.stringify(data)
        ).end();

    } catch (e) {
        this._log('warn', req, res, {
            message: 'WebServer._provideHeartBeat::Heartbeat of server is not working',
            error: e
        });

        res.end();
    }
};

WebServer.prototype._catchAll = function (req, res, next) {
    this._log('error', req, res, {message: 'Unhandled url', url: req.originalUrl});
    res.status(404).send('We have gone fishing... Eventually you will see a pretty graphic here').end();
};

WebServer.prototype._log = function (level, req, res, msg) {
    if (this._logger && this._logger[level])
        this._logger[level](msg);
};

exports = module.exports = WebServer;
