'use strict';

var Session = require('express').session;

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

                // Get session from store
                baboon.session.getSession(data.headers.cookie, function(error, session) {

                    if (error || !session) {
                        return callback(null, false);
                    }

                    // restricted socket connection
                    if (baboon.config.rights.enabled && baboon.config.rights.masterLoginPage) {

                        if (session.user && session.user.id !== -1) {
                            return callback(null, true);
                        }
                        else {
                            return callback(null, false);
                        }
                    }
                    else {
                        if (session.user && session.user.id >= -1) {
                            return callback(null, true);
                        }
                        else {
                            return callback(null, false);
                        }
                    }
                });
            }
        });
    });

    // production config
    io.configure('production', function () {
        io.enable('browser client minification');
        io.enable('browser client etag');
    });
};