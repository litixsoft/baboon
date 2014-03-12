'use strict';

module.exports = function(io, baboon) {

    // config for all
    io.configure(function () {

        // transports
        io.set('transports',
            [
                'websocket',
                'htmlfile',
                'xhr-polling',
                'jsonp-polling'
            ]
        );

        // logger
        io.set('logger', baboon.loggers.socket);

        // authorization
        io.set('authorization', function (data, callback) {

            // check if cookie exists
            if (!data.headers.cookie) {
                callback(null, false);
            }
            else {
                callback(null, true);
            }
//            else {
//                // parse cookie in sessionId
//                var signedCookies = require('express/node_modules/cookie').parse(data.headers.cookie),
//                    sessionId = require('express/node_modules/connect/lib/utils')
//                        .parseSignedCookies(signedCookies, config.sessionSecret)[config.sessionKey];
//
//                // get session from redis session store
//                sessionStore.get(sessionId, function (err, session) {
//                    if (err || !session) {
//                        callback(null, false);
//                    } else {
//
//                        var isAuth = true;
//
//                        // restricted socket connection when extraLoginPage is enabled
//                        if (config.useRightsSystem && config.extraLoginPage) {
//                            isAuth = session.user && session.user.id !== -1;
//                        }
//
//                        if (isAuth) {
//                            data.session = session;
//                            data.session.sessionID = sessionId;
//                            callback(null, true);
//                        }
//                        else {
//                            callback(null, false);
//                        }
//                    }
//                });
//            }
        });
    });

    // production config
    io.configure('production', function () {
        io.enable('browser client minification');
        io.enable('browser client etag');
        io.enable('browser client gzip');
    });
};