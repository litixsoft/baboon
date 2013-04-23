'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../../lib/baboon')(path.join(__dirname, '../')),
    auth = baboon.middleware.auth,
    server = baboon.server,
    io = server.io,
    config = server.config;

io.sockets.on('connection', function (client) {
    'use strict';

    client.on('message', function(message) {
        console.log(message);
    });

    client.on('disconnect', function() {
        console.log('client: ' + client.id + ' disconnected');
    });

    client.emit('send:name', {
        name: 'Bob'
    });

    setInterval(function () {
        client.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 1000);
});

server.start();