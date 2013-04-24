exports.socket = function(io, syslog) {

    //var enterprise = require('enterprise/enterprise'),
    var blog = require('../app/blog');

    io.sockets.on('connection', function (socket) {
        syslog.info('client: ' + socket.id + ' connected');

        socket.on('disconnect', function() {
            syslog.info('socket: ' + socket.id + ' disconnected');
        });

        blog.init({socket:socket, key: 'blog'});
    });
};
