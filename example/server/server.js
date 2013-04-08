var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    rootPath = path.join(__dirname, '../'),
    distPath = path.join(rootPath, 'client', 'dist'),
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
    serverModus = 'development';

app = express();
appHelpers.getMimeType = function(url) {
    'use strict';

    var extName = path.extname(url).substring(1);
    if(mimeTypeMap.hasOwnProperty(extName)) {
        return mimeTypeMap[extName];
    }
    else {
        return mimeTypeMap.txt;
    }
};
appHelpers.sendFile = function(pathname, res) {
    'use strict';

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

if (serverModus === 'development') {
    var exec = require('child_process').exec;
    var cmd = 'cd ' + rootPath + '& grunt build';
    exec(cmd, function (error, stdout) {
        'use strict';

        if (error !== null) {
            console.log('exec error: ' + error);
        }

        console.log('stdout: ' + stdout.toString());
    });
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
app.get('/', function(req, res){
    'use strict';
    // TODO Rechte
    appHelpers.sendFile('index.html', res);
});

app.get('/scripts/*', function(req, res){
    'use strict';
    // TODO Rechte
    appHelpers.sendFile(req.url, res);
});
app.get('/views/*', function(req, res){
    'use strict';
    // TODO Rechte
    appHelpers.sendFile(req.url, res);
});

app.get('*.*', function (req, res) {
    'use strict';
    appHelpers.sendFile(req.url, res);
});

app.get('*', function (req, res) {
    'use strict';
    appHelpers.sendFile('index.html', res);
});

http.createServer(app).listen(app.get('port'), function(){
    'use strict';
    console.log('Express server listening on port ' + app.get('port'));
});
