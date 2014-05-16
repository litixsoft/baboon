'use strict';

var Session = require('express-session').Session;

/**
 * SocketIO Configuration Object
 *
 * @param {!Object} io
 * @param {!Object} baboon
 * @return {Object}
 */
module.exports = function (io, baboon) {

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

                // save sessionID and session store for socket
                data.sessionID = baboon.session.getSessionId(data.headers.cookie);
                data.sessionStore = baboon.session.getSessionStore();

                baboon.session.getSessionById(data.sessionID, function (error, session) {

                    if (error || !session) {
                        return callback(null, false);
                    }
                    else {

                        // save session in socket
                        data.session = new Session(data, session);

                        // restricted socket connection for users with session
                        if (session.user) {
                            // connect successfully
                            return callback(null, true);
                        }
                        else {
                            // connect failed
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

    // socket connection event
    io.sockets.on('connection', function (socket) {
        baboon.transport.registerSocketEvents(socket);
    });
};