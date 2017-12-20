'use strict';

// Add any commonly used utility methods here.
const UTILS = {
    getClientIPAddr :  function(req) {
        // First check if the x-forwarded-for header is present
        var headers = req['headers'];
        if(headers['x-forwarded-for']) {
            var ipAddrs = headers['x-forwarded-for'].split(',');
            if(ipAddrs.length > 0)
            // the first one is supposed to be client's ip addr
                return ipAddrs[0].trim();
        }

        // Next just get the ipAddr of the host connecting to us
        return req.socket.remoteAddress;
    }
};

module.exports = UTILS;