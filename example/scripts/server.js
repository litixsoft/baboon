'use strict';

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    rootPath = path.join(__dirname, '../'),
    distPath = path.join(rootPath, 'build', 'dist'),
    mimeTypeMap = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'xml': 'application/xml',
        'json': 'application/json',
        'js': 'application/javascript',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'png': 'image/png',
        'svg': 'image/svg+xml'
    },
    app,
    appHelpers = {},
    server;

app = express();
server = http.createServer(app);

appHelpers.getMimeType = function(url) {

    var extName = path.extname(url).substring(1);
    if(mimeTypeMap.hasOwnProperty(extName)) {
        return mimeTypeMap[extName];
    }
    else {
        return mimeTypeMap.txt;
    }
};
appHelpers.sendFile = function(pathname, res) {

    res.setHeader('Content-Type', appHelpers.getMimeType(pathname));

    var file = fs.createReadStream(path.join(distPath, pathname));
    file.on('data', res.write.bind(res));
    file.on('close', function () {
        res.end();
    });
    file.on('error', function (error) {
        console.log(error);
    });
};

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
app.get('/', function(req, res){
    // TODO Rechte
    appHelpers.sendFile('index.html', res);
});

app.get('/scripts/*', function(req, res){
    // TODO Rechte
    appHelpers.sendFile(req.url, res);
});
app.get('/views/*', function(req, res){
    // TODO Rechte
    appHelpers.sendFile(req.url, res);
});

app.get('*.*', function (req, res) {
    appHelpers.sendFile(req.url, res);
});

app.get('*', function (req, res) {
    appHelpers.sendFile('index.html', res);
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});