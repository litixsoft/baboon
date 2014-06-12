'use strict';

describe('Middleware/ErrorHandler', function () {

    var path = require('path');
    var rootPath = path.resolve(__dirname, '../../');
    var errorHandler = require(path.resolve(rootPath, 'lib', 'middleware', 'errorHandler'));
    var appMock = require(path.resolve(rootPath, 'test', 'mocks', 'appMock'));
    var Error = require(path.resolve(rootPath, 'lib', 'errors'));
    var NavigationError = Error.NavigationError;
    var AuthError = Error.AuthError;
    var mock, sut;

    beforeEach(function() {
        spyOn(console, 'log');
        mock = appMock();
        sut = errorHandler(mock.baboon.config, mock.baboon.loggers.syslog);
    });

    it('should be defined errorHandler', function() {
        expect(sut).toBeDefined();
        expect(sut.errorHandler).toBeDefined();
    });

    it('should be return correct error html', function() {

        var errorTitle = 'Error: ' + mock.baboon.config.app_name;
        var appName = mock.baboon.config.app_name;

        var errorCode = 400;
        var errorMessage = 'unit test error';

        var error = new NavigationError('unit test error', 400);
        var errorStack = error.stack;

        var html = '<html><head><meta charset=\'utf-8\'><title>' + errorTitle + '</title>' +
            '<style>*{margin:0;padding:0;outline:0}body{padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande","Arial";' +
            'background:#ece9e9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ece9e9));' +
            'background:#ece9e9 -moz-linear-gradient(top,#fff,#ece9e9);background-repeat:no-repeat;color:#555;' +
            '-webkit-font-smoothing:antialiased}h1,h2,h3{font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;' +
            'font-weight:normal}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;' +
            'border-bottom:1px solid #eee;font-size:18px}ul li{list-style:none}ul li:hover{cursor:pointer;' +
            'color:#2e2e2e}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}@media(max-width:768px){body{font-size:13px;' +
            'line-height:16px;padding:0}}</style></head><body><div id="wrapper"> <h1>' + appName + '</h1> ' +
            '<h2><em>' + errorCode + '</em>' + errorMessage + '</h2> <ul id="stacktrace">' + errorStack + '</ul></div></body></html>';

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(html).toBe(res.data);
    });

    it('should be return correct error html with displayClient parameter', function() {

        // overwrite sut
        mock.baboon.config.node_env = 'production';
        sut = errorHandler(mock.baboon.config, mock.baboon.loggers.syslog);

        var errorTitle = 'Error: ' + mock.baboon.config.app_name;
        var appName = mock.baboon.config.app_name;

        var errorCode = 400;
        var errorMessage = 'unit test error';

        var error = new NavigationError('unit test error', 400);
        error.displayClient = true;
        var errorStack = [];

        var html = '<html><head><meta charset=\'utf-8\'><title>' + errorTitle + '</title>' +
            '<style>*{margin:0;padding:0;outline:0}body{padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande","Arial";' +
            'background:#ece9e9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ece9e9));' +
            'background:#ece9e9 -moz-linear-gradient(top,#fff,#ece9e9);background-repeat:no-repeat;color:#555;' +
            '-webkit-font-smoothing:antialiased}h1,h2,h3{font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;' +
            'font-weight:normal}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;' +
            'border-bottom:1px solid #eee;font-size:18px}ul li{list-style:none}ul li:hover{cursor:pointer;' +
            'color:#2e2e2e}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}@media(max-width:768px){body{font-size:13px;' +
            'line-height:16px;padding:0}}</style></head><body><div id="wrapper"> <h1>' + appName + '</h1> ' +
            '<h2><em>' + errorCode + '</em>' + errorMessage + '</h2> <ul id="stacktrace">' + errorStack + '</ul></div></body></html>';

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(html).toBe(res.data);
    });

    it('should be return correct error html without status code', function() {

        var errorTitle = 'Error: ' + mock.baboon.config.app_name;
        var appName = mock.baboon.config.app_name;

        var errorCode = 500;
        var errorMessage = 'Internal server error';

        var error = new NavigationError('unit test error', 400);
        delete error.status;
        var errorStack = error.stack;

        var html = '<html><head><meta charset=\'utf-8\'><title>' + errorTitle + '</title>' +
            '<style>*{margin:0;padding:0;outline:0}body{padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande","Arial";' +
            'background:#ece9e9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ece9e9));' +
            'background:#ece9e9 -moz-linear-gradient(top,#fff,#ece9e9);background-repeat:no-repeat;color:#555;' +
            '-webkit-font-smoothing:antialiased}h1,h2,h3{font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;' +
            'font-weight:normal}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;' +
            'border-bottom:1px solid #eee;font-size:18px}ul li{list-style:none}ul li:hover{cursor:pointer;' +
            'color:#2e2e2e}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}@media(max-width:768px){body{font-size:13px;' +
            'line-height:16px;padding:0}}</style></head><body><div id="wrapper"> <h1>' + appName + '</h1> ' +
            '<h2><em>' + errorCode + '</em>' + errorMessage + '</h2> <ul id="stacktrace">' + errorStack + '</ul></div></body></html>';

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(html).toBe(res.data);
    });

    it('should be return correct error html in production mode', function() {

        // overwrite sut
        mock.baboon.config.node_env = 'production';
        sut = errorHandler(mock.baboon.config, mock.baboon.loggers.syslog);

        var errorTitle = 'Error: ' + mock.baboon.config.app_name;
        var appName = mock.baboon.config.app_name;

        var errorCode = 500;
        var errorMessage = 'Internal server error';
        var error = new NavigationError('unit test error', 400);
        var errorStack = [];

        var html = '<html><head><meta charset=\'utf-8\'><title>' + errorTitle + '</title>' +
            '<style>*{margin:0;padding:0;outline:0}body{padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande","Arial";' +
            'background:#ece9e9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ece9e9));' +
            'background:#ece9e9 -moz-linear-gradient(top,#fff,#ece9e9);background-repeat:no-repeat;color:#555;' +
            '-webkit-font-smoothing:antialiased}h1,h2,h3{font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;' +
            'font-weight:normal}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;' +
            'border-bottom:1px solid #eee;font-size:18px}ul li{list-style:none}ul li:hover{cursor:pointer;' +
            'color:#2e2e2e}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}@media(max-width:768px){body{font-size:13px;' +
            'line-height:16px;padding:0}}</style></head><body><div id="wrapper"> <h1>' + appName + '</h1> ' +
            '<h2><em>' + errorCode + '</em>' + errorMessage + '</h2> <ul id="stacktrace">' + errorStack + '</ul></div></body></html>';

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(html).toBe(res.data);
    });

    it('should be return correct error json', function() {

        var error = new AuthError('unit test error', 400);

        var json = {
            name: 'AuthError',
            message: 'unit test error',
            status: 400,
            displayClient: false
        };

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(json).toEqual(res.data);
    });

    it('should be return correct error json when status < 400', function() {

        var error = new AuthError('unit test error', 200);

        var json = {
            name: 'AuthError',
            message: 'unit test error',
            status: 200,
            displayClient: false
        };

        var res = mock.res;
        sut.errorHandler(error, {}, res, function(){});
        expect(json).toEqual(res.data);
        expect(500).toBe(res.statusCode);
    });
});
