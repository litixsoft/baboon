var baboon = require('../lib/baboon')(__dirname),
    app = baboon.express.app,
    middleware = baboon.middleware,
    server = baboon.server,
    config = baboon.config,
    httpRoutes = require('./routes/http');

// routes
app.get('/', httpRoutes.index);
app.get('/login', httpRoutes.login);
app.get('/app', middleware.restricted, httpRoutes.app);
app.get('/contact', httpRoutes.contact);


server.start();