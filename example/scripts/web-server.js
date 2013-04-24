'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../../lib/baboon')(path.join(__dirname, '../')),
    auth = baboon.middleware.auth,
    server = baboon.server,
    io = server.io,
    config = server.config;

io.sockets.on('connection', function (client) {

    client.on('message', function(message) {
        console.log(message);
    });

    client.on('disconnect', function() {
        console.log('client: ' + client.id + ' disconnected');
    });

    client.on('send:test', function (data, callback) {
        var end = new Date().toTimeString();
        var res = {fromClient: data, fromServer: end};
        callback(res);
    });
});

server.start();