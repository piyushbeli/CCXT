// System imports
const FS      = require('fs'),
      PROGRAM = require('commander');

// Local imports
const LOGGER  = require(__dirname + '/utils/logger.js'),
      WEBSERVER = require(__dirname + '/webServer.js');

//
// Read the cmd line params, which is pretty much the location of config file for now
//
function ConfValidator(path) {
    if(!FS.existsSync(path))
        throw new Error('PiyushTest::Config file ' + path + ' does not exist');
    return path;
}

PROGRAM
    .option('-c, --config [config]',
    'Config file to use, default conf/serverConf.js', ConfValidator, (__dirname + '/conf/serverConf.js'))
    .parse(process.argv);

const CONF   = require(PROGRAM.config),
      logger = LOGGER;

logger.info({
    message : 'PiyushTestServer:Conf used',
    conf    : CONF
});

logger.info({message : 'PiyushTest::Server Starting'});

const webServer = new WEBSERVER(CONF, {logger : logger});
webServer.start();

webServer.on('start', function() {
    logger.info({
        message: 'PiyushTest::Server started'
    });
});

webServer.on('error', function(err) {
    logger.error({
        message : 'PiyushTest::Error starting web server ',
        error   : err
    });

    process.exit(1);
});

// Catch all (including async) exceptions. This isn't good, but we don't want to terminate the server
process.on('uncaughtException', function(e) {
    logger.error({ message:'PiyushTest::THIS IS REALLY BAD::Encountered uncaught exception ', stack : e.stack});

    // We'll keep going and not terminate for now...
});