'use strict';
//noinspection JSUnresolvedVariable
var baboon = require('../../lib/baboon')(__dirname),
    routes = require('./routes')(baboon.middleware),
    server = baboon.server,
    app = baboon.express.app;

app.get('/', routes.index);
//app.get('/login', routes.login);
//app.post('/login', auth.login);
//app.get('/logout', auth.logout);
//app.get('/module1', auth.restricted, routes.module1);

server.start();

