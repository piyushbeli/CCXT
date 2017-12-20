const CONF = {
    HTTP_PORT: 9001,
    MYSQL_CONFIG: {
        user: 'root',
        host: 'localhost',
        password: 'root', //If you do not set any password for user mysql server then keep this empty string.
        connectTimeout: 60*1000 //60 seconds. Default is 10 seconds.
    },
    CRON_FREQUENCY: 5*60*1000 //In milliseconds
};

//
// Allow environment variables to override values in the config file. This is to make changing config easier, instead
// of mucking with conf files.
//
for (env in process.env) {
    if (env.match(/^zi_piyush_test_server_/))
        CONF[env.replace(/^zi_piyush_test_server_/,'')] = process.env[env];
}

exports = module.exports = CONF;