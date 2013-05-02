module.exports = function(middleware, app, sendFile, defaultApp) {
    'use strict';

    middleware = null;

    /**
     * routes
     */

    app.get('/', function (req, res) {
        sendFile(defaultApp + '.html', res);
    });

    app.get('/blog', function (req, res) {
        sendFile('blog' + '.html', res);
    });

    app.get('/enterprise', function (req, res) {
        sendFile('enterprise' + '.html', res);
    });

    app.get('/home', function (req, res) {
        sendFile('home' + '.html', res);
    });

    app.get('/ui_examples', function (req, res) {
        sendFile('ui_examples' + '.html', res);
    });

    app.get('*.html', function (req, res) {
        res.send(404);
    });

    app.get('*.*', function (req, res) {
        sendFile(req.url, res);
    });

    app.get('*', function (req, res) {
        sendFile(defaultApp + '.html', res);
    });
};