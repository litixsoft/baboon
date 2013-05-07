'use strict';

module.exports = function (io, syslog, config) {
    var lxHelpers = require('lx-Helpers'),
        acl = {
            modules: [
                { name: 'blog', resources: ['getAllPosts', 'getPostById'] },
                { name: 'enterprise', resources: ['getAll', 'getById', 'updateById', 'create'] }
            ]
        };

    /**
     * start websocket
     */
    io.sockets.on('connection', function (socket) {
        var tmp;

        syslog.info('client: ' + socket.id + ' connected');

        socket.on('disconnect', function () {
            syslog.info('socket: ' + socket.id + ' disconnected');
        });

        /**
         * include modules and register resources
         */
        lxHelpers.arrayForEach(acl.modules, function (mod) {
            tmp = require('./app/' + mod.name)(socket, mod, config);
        });
    });
};
