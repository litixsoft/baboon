'use strict';

var Session = require('express-session').Session;

/**
 * SocketIO Configuration Object
 *
 * @param {!Object} io
 * @param {!Object} baboon
 * @return {Object}
 */
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

                // save sessionID and session store for socket
                data.sessionID = baboon.session.getSessionId(data.headers.cookie);
                data.sessionStore = baboon.session.getSessionStore();

                baboon.session.getSessionById(data.sessionID, function(error, session) {

                    if (error || !session) {
                        return callback(null, false);
                    }
                    else {

                        // save session in socket
                        data.session = new Session(data, session);

                        // check restricted socket connection
                        if (baboon.config.rights.enabled && baboon.config.rights.masterLoginPage) {

                            // by masterLoginPage, the user must not be a guest
                            if (session.user && baboon.rights.userIsInRole(session.user, 'User')) {

                                // connect successfully
                                return callback(null, true);
                            }
                            else {

                                // connect failed
                                return callback(null, false);
                            }
                        }
                        else {

                            // by not master LoginPage, the user must be a guest or higher
                            if (session.user && baboon.rights.userIsInRole(session.user, 'Guest') || baboon.rights.userIsInRole(session.user, 'User')) {

                                // connect successfully
                                return callback(null, true);
                            }
                            else {

                                // connect failed
                                return callback(null, false);
                            }
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