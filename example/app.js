//noinspection JSUnresolvedVariable
var baboon = require('../lib/baboon')(__dirname),
    httpRoutes = require('./routes/http'),
    app = baboon.express.app,
    auth = baboon.middleware.auth,
    server = baboon.server,
    io = server.io,
    config = server.config;

// routes
app.get('/', httpRoutes.index);
app.get('/login', httpRoutes.login);
app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.get('/app', auth.restricted, httpRoutes.app);
app.get('/contact', httpRoutes.contact);

io.sockets.on('connection', function (socket) {
    'use strict';

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