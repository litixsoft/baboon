'use strict';

/**
 * The socket api.
 *
 * @param {!object} app The baboon object.
 */
module.exports = function (app) {
    var lxHelpers = require('lx-Helpers'),
        acl = {
            modules: [
                { name: 'blog', resources: ['getAllPosts', 'getPostById', 'createPost'] },
                { name: 'enterprise', resources: ['getAll', 'getById', 'updateById', 'create'] }
            ]
        };

    /**
     * start websocket
     */
    app.server.sio.sockets.on('connection', function (socket) {
        var tmp;

        app.logging.syslog.info('client: ' + socket.id + ' connected');

        socket.on('disconnect', function () {
            app.logging.syslog.info('socket: ' + socket.id + ' disconnected');
        });

        /**
         * include modules and register resources
         */
        lxHelpers.arrayForEach(acl.modules, function (mod) {
            tmp = require('./app/' + mod.name)(socket, mod, app);
        });
    });
};
