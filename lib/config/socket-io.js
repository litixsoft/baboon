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
    // Middleware
    io.use(function (socket, next) {
        // check if cookie exists
        if (!socket.request.headers || !socket.request.headers.cookie) {
            return next(null, false);
        }

        // save sessionID and session store for socket
        socket.request.sessionID = baboon.session.getSessionId(socket.request.headers.cookie);
        socket.request.sessionStore = baboon.session.getSessionStore();

        baboon.session.getSessionById(socket.request.sessionID, function (error, session) {
            if (error || !session) {
                return next(null, false);
            } else {
                // save session in socket
                socket.request.session = new Session(socket.request, session);

                // restricted socket connection for users with session
                // connect successfully or failed
                return next(null, !!session.user);
            }
        });
    });

    // socket connection event
    io.on('connection', function (socket) {
        baboon.transport.registerSocketEvents(socket);
    });
};
