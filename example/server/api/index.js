exports.socket = function(io, syslog) {

    var acl = {
        module: [
            { name: 'blog', resources: ['test'] },
            { name: 'enterprise', resources: ['getAll', 'getById', 'updateById', 'create'] }
        ]
    };

    /**
     * start websocket
     */
    io.sockets.on('connection', function (socket) {
        syslog.info('client: ' + socket.id + ' connected');

        socket.on('disconnect', function() {
            syslog.info('socket: ' + socket.id + ' disconnected');
        });

        /**
         * include modules and register resources
         */
        var i, max, tmp;
        for(i=0, max= acl.module.length; i < max; i += 1) {
            tmp = require('./socket/app/' + acl.module[i].name)(socket, acl.module[i]);
        }
    });
};
