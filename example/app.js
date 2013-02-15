//noinspection JSUnresolvedVariable
GLOBAL.bbConfig = require('./config.json');
//noinspection JSUnresolvedVariable
bbConfig.basePath = __dirname;

//noinspection JSUnresolvedVariable
var baboon = require('../lib/baboon'),
    app = baboon.express.app,
    auth = baboon.middleware.auth,
    server = baboon.server,
    httpRoutes = require('./routes/http');

// routes
app.get('/', httpRoutes.index);
app.get('/login', httpRoutes.login);
app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.get('/app', auth.restricted, httpRoutes.app);
app.get('/contact', httpRoutes.contact);

server.start();
