//noinspection JSUnresolvedVariable
GLOBAL.bbConfig = require('./config.json');
//noinspection JSUnresolvedVariable
bbConfig.basePath = __dirname;

//noinspection JSUnresolvedVariable
var baboon = require('../lib/baboon'),
    httpRoutes = require('./routes/http');

baboon(function (err, res) {
    'use strict';

    if (err) {
        console.error(err);
        throw new Error(err);
    }

    var app = res.express.app,
        auth = res.middleware.auth,
        server = res.server,
        io = server.io;

    // routes
    app.get('/', httpRoutes.index);
    app.get('/login', httpRoutes.login);
    app.post('/login', auth.login);
    app.get('/logout', auth.logout);
    app.get('/app', auth.restricted, httpRoutes.app);
    app.get('/contact', httpRoutes.contact);


    io.sockets.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('my other event', function (data) {
            console.log(data);
        });

        setInterval(function () {
            socket.emit('send:time', {
                time: (new Date()).toString()
            });
        }, 1000);
    });

    server.start();
});



