var baboon = require('../lib/baboon')(__dirname),
    app = baboon.express.app,
    auth = baboon.middleware.auth,
    server = baboon.server,
    config = baboon.config,
    httpRoutes = require('./routes/http');

// routes
app.get('/', httpRoutes.index);
app.get('/login', httpRoutes.login);
app.post('/login', auth.login);
app.get('/logout', auth.logout);
app.get('/app', auth.restricted, httpRoutes.app);
app.get('/contact', httpRoutes.contact);


server.start();