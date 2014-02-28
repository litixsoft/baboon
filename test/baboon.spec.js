'use strict';

describe('Baboon', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../'));
    var baboon = require(path.resolve(path.join(rootPath, 'lib', 'baboon')));

    var http = require('http');
//    var https = require('https');

    it('should be defined baboon', function () {
        expect(baboon).toBeTruthy();
    });

    it('should be initialized correctly', function () {
        var rootPath = path.join(__dirname, '../', 'test', 'mocks');
        var sut = baboon(rootPath, {config: 'development'});

        expect(sut).toBeDefined();
        expect(sut.loggers).toBeDefined();
        expect(sut.config).toBeDefined();
        expect(sut.navigation).toBeDefined();
        expect(sut.errorHandler).toBeDefined();

        expect(sut.serverListen).toBeDefined();
    });

    describe('serverListen', function () {
        var sut;

        // init baboon before test
        beforeEach(function () {
            var rootPath = path.join(__dirname, '../', 'test', 'mocks');
            sut = baboon(rootPath, {config: 'development'});
        });

        it('should throw error if wrong transport protocol in config is defined', function () {
            sut.config.protocol = 'abc';
            var f = function () {sut.serverListen(null);};
            expect(f).toThrow();
        });

        it('should be startet in http mode', function (done) {
            sut.config.protocol = 'http';
            sut.config.port = '3002';

            var onRequest = function (request) {
                expect(request.url).toBe('/baboon');

                done();
            };

            sut.serverListen(onRequest);
            http.get('http://localhost:3002/baboon');
        });

        it('should be startet in https mode', function () {
//            sut.config.protocol = 'https';
//            sut.config.port = '3003';
//
//            var onRequest = function (request) {
//                expect(request.url).toBe('/baboon');
//
//                done();
//            };
//
//            sut.serverListen(onRequest);
//            https.get('https://localhost:3003/baboon');

            sut.config.protocol = 'https';
            sut.config.port = '3001';
            sut.config.logging.loggers.syslog.appender = 'abc';
            sut.serverListen(null);
        });
    });
});
