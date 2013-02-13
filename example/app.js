var bb = require('../lib/baboon')(__dirname),
    app = bb.app,
    httpRoutes = require('./routes/http');

// routes
app.get('/', httpRoutes.index);
app.get('/login', httpRoutes.login);
app.get('/app', bb.middleware.restricted, httpRoutes.app);
app.get('/contact', httpRoutes.contact);

// Start application server
bb.startServer();