/*global describe, it, expect*/
describe('Transport', function () {
    'use strict';

    var path = require('path');
    var rootPath = path.resolve(__dirname, '../');
    var appMock = require('./mocks/appMock')();
    var baboon = appMock.baboon;
    var transport = require(path.resolve(rootPath, 'lib', 'transport'));
    var TransportError = require(path.resolve(path.join(__dirname, '../', 'lib', 'errors'))).TransportError;
    var sut;

    it('should throw an Error when not given params', function () {
        var func = function () {
            return transport();
        };
        expect(func).toThrow(new TransportError(400, '', 'Parameter baboon with baboon.config is required!'));
    });

    it('should throw an Error when not given param.config', function () {
        var func = function () {
            return transport({});
        };
        expect(func).toThrow();
    });

    it('should be initialzied correctly', function () {
        var sut = transport(baboon);

        expect(sut.getControllers).toBeDefined();
        expect(sut.addController).toBeDefined();
        expect(sut.processRequest).toBeDefined();
        expect(sut.registerSocketEvents).toBeDefined();
    });

    it('should be initialzied correctly with missing param "config.useRightSystem"', function () {
        var sut = transport({
            config: {
                path: {
                    modules: path.join(path.resolve('./test/mocks'), 'server', 'modules')
                }
            }
        });

        expect(sut.getControllers).toBeDefined();
        expect(sut.addController).toBeDefined();
        expect(sut.processRequest).toBeDefined();
        expect(sut.registerSocketEvents).toBeDefined();
    });

    describe('.getControllers()', function () {
        beforeEach(function () {
            sut = transport(baboon);
        });

        it('should return object of controllers and their actions', function () {
            var controllers = sut.getControllers();

            expect(Object.keys(controllers).length).toBe(1);

            var actions = controllers[Object.keys(controllers)[0]];
            expect(Object.keys(actions).length).toBe(4);
        });
    });

    describe('.addController()', function () {
        beforeEach(function () {
            sut = transport(baboon);
        });

        it('should add a controller with wrong action signatures', function () {
            var controllerNotOk = {
                foo1: function () {},
                foo2: function (data) {return data;},
                foo3: function (data, request) {return [data, request];},
                foo4: function (data, callback) {callback(data);},
                foo5: function (request, callback) {callback(request);},
                foo6: function (data, request, callback, bar) {callback([data, request, bar]);}
            };

            sut.addController(controllerNotOk, 'user/rights/', null);
            var controllers = sut.getControllers();
            expect(Object.keys(controllers).length).toBe(1);

            var actions = controllers[Object.keys(controllers)[0]];
            expect(Object.keys(actions).length).toBe(4);
        });

        it('should add a controller with actions', function () {
            var controllerOk = {
                read: function (data, request, callback) {callback([data, request]);},
                write: function (data, request, callback) {callback([data, request]);},
                remove: function (data, request, callback) {callback([data, request]);}
            };

            sut.addController(controllerOk, 'user/rights', null);

            var controllers = sut.getControllers();
            expect(Object.keys(controllers).length).toBe(2);

            var actions = controllers[Object.keys(controllers)[1]];
            expect(Object.keys(actions).length).toBe(3);
        });

        it('should do nothing when file does not exist', function () {
            var file = path.resolve(__dirname, '..', 'mocks', 'server', 'employees');

            sut.addController(file, 'user/rights', null);

            var controllers = sut.getControllers();
            expect(Object.keys(controllers).length).toBe(1);

            var actions = controllers[Object.keys(controllers)[0]];
            expect(Object.keys(actions).length).toBe(4);
        });

        it('should add a controller file with actions', function () {
            var file = path.resolve(__dirname, '..', 'test', 'mocks', 'server', 'employees.js');

            sut.addController(file, 'user/rights', null);

            var controllers = sut.getControllers();
            expect(Object.keys(controllers).length).toBe(2);

            var actions = controllers[Object.keys(controllers)[1]];
            expect(Object.keys(actions).length).toBe(1);
        });
    });

    describe('.processRequest()', function () {

        beforeEach(function() {
            spyOn(console, 'log');
        });

        it('should process the request and call the corresponding action with rightsystem disabled', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(200);
                    expect(value).toBeDefined();
                    expect(value.length).toBe(5);

                    done();
                }
            };

            req.originalUrl = '/api/common/awesomeThings/index/getAll';

            sut = transport(baboon);
            sut.processRequest(req, res);
        });

        it('should process the request and return wrong url', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(404);
                    expect(value).toBe('Wrong url');

                    done();
                }
            };

            req.originalUrl = '/api/common/awesomeThings/index/foo';

            sut = transport(baboon);
            sut.processRequest(req, res);
        });

        it('should process the request and return an raised error', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(500);
                    expect(value.message).toBe('Error raised');
                    expect(value.stack).toBe('Error stack');

                    done();
                }
            };

            req.originalUrl = '/api/common/awesomeThings/index/raiseError';

            sut = transport(baboon);
            sut.processRequest(req, res);
        });

        it('should process the request and return an raised error with status code', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(500);
                    expect(value.message).toBe('Error raised');
                    expect(value.stack).toBe('Error stack');

                    done();
                }
            };

            req.originalUrl = '/api/common/awesomeThings/index/raiseErrorWithStatus';

            sut = transport(baboon);
            sut.processRequest(req, res);
        });

//        it('should process the request and process the session', function (done) {
//            var req = appMock.req;
//            var res = {
//                json: function (code, value) {
//                    expect(code).toBe(200);
//                    expect(value).toBeDefined();
//
//                    done();
//                }
//            };
//
//            req.originalUrl = '/api/common/awesomeThings/index/sessionTest';
//
//            sut = transport(baboon);
//            sut.processRequest(req, res);
//        });

        it('should process the request with right system enabled but user has no access to function', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(403);
                    expect(value).toBeDefined();

                    baboon.config.rights.enabled = false;
                    req.session = {};

                    done();
                }
            };

            req.originalUrl = '/api/userHasNoAccessToFunction';
            baboon.config.rights.enabled = true;
            req.session.user = {};
            sut = transport(baboon);
            sut.processRequest(req, res);
        });

        it('should not process the request with right system enabled and user has no access to', function (done) {
            var req = appMock.req;
            var res = {
                json: function (code, value) {
                    expect(code).toBe(403);
                    expect(value).toBe('Access denied');

                    baboon.config.rights.enabled = false;

                    done();
                }
            };

            req.originalUrl = '/api/common/awesomeThings/index/noAccessTo';
            baboon.config.rights.enabled = true;

            sut = transport(baboon);
            sut.processRequest(req, res);
        });
    });

    describe('.registerSocketEvents()', function () {
        it('should register events on socket', function (done) {
            var socket = appMock.socket;
            socket.events = {};

            sut = transport(baboon);
            sut.registerSocketEvents(socket);

            expect(Object.keys(socket.events).length).toBe(4);

            socket.events['api/common/awesomeThings/index/getAll']({}, function (error, result) {
                expect(error).toBeNull();
                expect(result).toBeDefined();
                expect(result.length).toBe(5);

                done();
            });
        });
    });

    describe('emit socket event', function () {
//        it('should process the request and process the session', function (done) {
//            var socket = appMock.socket;
//            socket.events = {};
//
//            sut = transport(baboon);
//            sut.registerSocketEvents(socket);
//
//            expect(Object.keys(socket.events).length).toBe(4);
//
//            socket.events['api/common/awesomeThings/index/sessionTest']({}, function (error, result) {
//                expect(error).toBeNull();
//                expect(result).toBeDefined();
//                expect(result.items).toBeDefined();
//                expect(result.count).toBeDefined();
//                expect(result.sessionCalls).toBeDefined();
//
//                done();
//            });
//        });

//        it('should not process the request when rights system is enabled and user has no acl', function (done) {
//            var socket = appMock.socket;
//            socket.events = {};
//
//            baboon.config.rights.enabled = true;
//
//            sut = transport(baboon);
//            sut.registerSocketEvents(socket);
//
//            expect(Object.keys(socket.events).length).toBe(0);
//
//            baboon.config.rights.enabled = false;
//            done();
//        });
//
//        it('should not process the request when rights system is enabled and user has acl but no access to functions', function (done) {
//            var socket = appMock.socket;
//            socket.events = {};
//            socket.handshake.headers.cookie = '12345';
//
//            baboon.config.rights.enabled = true;
//
//            sut = transport(baboon);
//            sut.registerSocketEvents(socket);
//
//            expect(Object.keys(socket.events).length).toBe(0);
//
//            baboon.config.rights.enabled = false;
//            done();
//        });
    });
});