'use strict';

// includes
var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

// vars
var buildPath = path.join(__dirname, 'build');
var app = express();
var server = http.createServer(app);

function sendFile (pathname, res) {

    var filePath = path.join(buildPath, pathname);
    if (fs.existsSync(filePath)) {
        res.sendfile(filePath);
    }
    else {
        res.send(404);
    }
}

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

// index route
app.get('/', function (req, res) {
    // TODO Rechte
    sendFile('index.html', res);
});

app.get('/app/*', function (req, res) {
    // TODO Rechte
    sendFile(req.url, res);
});
app.get('/views/*', function (req, res) {
    // TODO Rechte
    sendFile(req.url, res);
});

app.get('*.*', function (req, res) {
    sendFile(req.url, res);
});

app.get('*', function (req, res) {
    sendFile('index.html', res);
});

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});