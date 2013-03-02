//noinspection JSUnresolvedVariable
GLOBAL.bbConfig = require('./config.json');
//noinspection JSUnresolvedVariable

var i, max, args = process.argv;
//noinspection JSUnresolvedVariable
for (i = 2, max = args.length; i < max; i += 1) {
    var tmp = args[i].split(':');

    if (tmp.length === 2) {
        switch (tmp[0]) {
            case 'https':
                console.log("https setting:" + tmp[1]);
                //noinspection JSUnresolvedVariable
                bbConfig.https = tmp[1];
                break;
            case 'port':
                //noinspection JSUnresolvedVariable
                bbConfig.port = tmp[1]
                console.log("port setting:" + tmp[1]);
                break;
            case 'mode':
                //noinspection JSUnresolvedVariable
                bbConfig.serverMode = tmp[1]
                console.log("port setting:" + tmp[1]);
                break;
        }
    }
}

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
        }, 5000);
    });

    server.start();
});



