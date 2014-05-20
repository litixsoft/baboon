/*global describe, it, expect*/
'use strict';

describe('Session', function () {

    var path = require('path');
    var Session = require('express-session').Session;

    var rootPath = path.resolve(path.join(__dirname, '../'));
    var SessionError = require(path.resolve(path.join(rootPath, 'lib', 'errors'))).SessionError;
    var appMock = require('./mocks/appMock');
    var session = require(path.resolve(path.join(rootPath, 'lib', 'session')));
    var mock, sut;

    describe('Test errors in lib', function () {
        it('should throw an Error when not given params', function () {
            var func = function () {
                return session();
            };
            expect(func).toThrow(new SessionError('Parameter baboon is required and must be a object type!'));
        });
    });

    describe('Test functions in lib', function () {
        beforeEach(function () {
            mock = appMock();
            sut = session(mock.baboon);
        });

        it('should be correct defined lib', function () {
            expect(sut).toBeDefined();
            expect(sut.getSessionStore).toBeDefined();
            expect(sut.getSessionId).toBeDefined();
            expect(sut.getSession).toBeDefined();
            expect(sut.setSession).toBeDefined();
            expect(sut.checkActivitySession).toBeDefined();
            expect(sut.setActivity).toBeDefined();
            expect(sut.getLastActivity).toBeDefined();
            expect(sut.getData).toBeDefined();
            expect(sut.setData).toBeDefined();
            expect(sut.deleteData).toBeDefined();
        });

        it('should be return inMemory sessionstore', function () {
            expect(typeof sut.getSessionStore()).toBe('object');
            expect(typeof sut.getSessionStore().sessions).toBe('object');
        });

        describe('Test getSessionID', function () {

            it('should throw an Error when not given parameter cookie', function () {

                var func = function () {
                    return sut.getSessionId();
                };
                expect(func).toThrow(new SessionError('Parameter cookie is required and must be a string type!'));
            });

            it('should throw an Error when parameter cookie is wrong type', function () {

                var func = function () {
                    return sut.getSessionId({});
                };
                expect(func).toThrow(new SessionError('Parameter cookie is required and must be a string type!'));
            });

            it('should be return correct sessionId', function () {

                // create test cookie
                var expectId = 'kuXMThISDw9LA7mkEQ0pnOZt';
                var cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';

                expect(sut.getSessionId(cookie)).toBe(expectId);
            });
        });

        describe('Test getSession', function () {

            beforeEach(function () {
                mock = appMock();
                sut = session(mock.baboon);
            });

            it('should throw an Error when not given parameter cookie', function () {

                var func = function () {
                    return sut.getSession();
                };
                expect(func).toThrow(new SessionError('Parameter cookie is required and must be a string type!'));
            });

            it('should throw an Error when parameter cookie is wrong type', function () {

                var func = function () {
                    return sut.getSession();
                };
                expect(func).toThrow(new SessionError('Parameter cookie is required and must be a string type!'));
            });

            it('should throw an Error when not given parameter callback', function () {

                var func = function () {
                    return sut.getSession('string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should throw an Error when parameter callback is wrong type', function () {
                var func = function () {
                    return sut.getSession('string', 'string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should be return correct session', function (done) {

                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"activity":"2014-03-18T09:35:52.768Z","start":"2014-03-18T09:35:52.767Z","data":{},"user":{"id":-1,"name":"guest"}}' };
                var cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    expect(error).toBeNull();
                    expect(sess.id).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(sess.user.name).toBe('guest');
                    done();
                });
            });

            it('should be return error when session not found in store ', function (done) {

                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();
                sessionStore.sessions = { puXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"activity":"2014-03-18T09:35:52.768Z","start":"2014-03-18T09:35:52.767Z","data":{},"user":{"id":-1,"name":"guest"}}' };
                var cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';

                sut.getSession(cookie, function (error, session) {

                    expect(session).toBeUndefined();
                    expect(error.message).toBe('session kuXMThISDw9LA7mkEQ0pnOZt: not found');
                    done();
                });
            });
        });

        describe('Test getSessionById', function () {

            beforeEach(function () {
                mock = appMock();
                sut = session(mock.baboon);
            });

            it('should throw an Error when not given parameter sid', function () {

                var func = function () {
                    return sut.getSessionById();
                };
                expect(func).toThrow(new SessionError('Parameter sid is required and must be a string type!'));
            });

            it('should throw an Error when parameter sid is wrong type', function () {

                var func = function () {
                    return sut.getSessionById(22);
                };
                expect(func).toThrow(new SessionError('Parameter sid is required and must be a string type!'));
            });

            it('should throw an Error when not given parameter callback', function () {

                var func = function () {
                    return sut.getSessionById('string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should throw an Error when parameter callback is wrong type', function () {
                var func = function () {
                    return sut.getSession('string', 'string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should be return correct session', function (done) {

                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"activity":"2014-03-18T09:35:52.768Z","start":"2014-03-18T09:35:52.767Z","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSessionById('kuXMThISDw9LA7mkEQ0pnOZt', function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    expect(error).toBeNull();
                    expect(sess.id).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(sess.user.name).toBe('guest');
                    done();
                });
            });

            it('should be return error when session not found in store ', function (done) {

                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();
                sessionStore.sessions = { puXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"activity":"2014-03-18T09:35:52.768Z","start":"2014-03-18T09:35:52.767Z","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSessionById('kuXMThISDw9LA7mkEQ0pnOZt', function (error, session) {

                    expect(session).toBeUndefined();
                    expect(error.message).toBe('session kuXMThISDw9LA7mkEQ0pnOZt: not found');
                    done();
                });
            });
        });

        describe('Test setSession', function () {

            beforeEach(function () {
                mock = appMock();
                sut = session(mock.baboon);
            });

            it('should throw an Error when not given parameter session', function () {
                var func = function () {
                    return sut.setSession();
                };
                expect(func).toThrow(new SessionError('Parameter session is required and must be a object type!'));
            });

            it('should throw an Error when parameter session is wrong type', function () {
                var func = function () {
                    return sut.setSession('string');
                };
                expect(func).toThrow(new SessionError('Parameter session is required and must be a object type!'));
            });

            it('should throw an Error when not given parameter callback', function () {
                var func = function () {
                    return sut.setSession({});
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should throw an Error when parameter callback is wrong type', function () {
                var func = function () {
                    return sut.setSession({}, 'string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should be set params in session', function (done) {

                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"2014-03-18T09:35:52.768Z","start":"2014-03-18T09:35:52.767Z","data":{},"user":{"id":-1,"name":"guest"}}' };
                var cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';

                // get session for new params
                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    expect(error).toBeNull();
                    expect(sess.id).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(sess.user.name).toBe('guest');

                    sess.user.name = 'test';

                    // set session
                    sut.setSession(sess, function (error, result) {

                        expect(error).toBeNull();
                        expect(result).toBe(true);

                        // get session with new params
                        sut.getSession(cookie, function (error, session) {
                            expect(error).toBeNull();

                            var sess = new Session({sessionID:'kuXMThISDw9LA7mkEQ0pnOZt'}, session);

                            expect(sess.id).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                            expect(sess.user.name).toBe('test');

                            done();
                        });
                    });
                });
            });

            it('should be return error from setSession', function (done) {
                // overwrite sessionStore
                var sessionStore = sut.getSessionStore();

                // overwrite set
                sessionStore.set = function (id, sess, callback) {
                    id = null;
                    sess = null;
                    callback(new SessionError('test error'));
                    done();
                };

                sut.setSession({}, function (error) {
                    expect(error.message.message).toBe('test error');
                    done();
                });
            });

        });

        describe('Test checkActivitySession', function () {

            var sessionStore, startDate, activityDate, cookie;

            beforeEach(function () {
                mock = appMock();
                sut = session(mock.baboon);

                sessionStore = sut.getSessionStore();
                startDate = new Date();
                activityDate = new Date();
                cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';
            });

            it('should throw an Error when not given parameter session', function () {
                var func = function () {
                    return sut.checkActivitySession();
                };
                expect(func).toThrow(new SessionError('Parameter session is required and must be a object type!'));
            });

            it('should throw an Error when parameter session is wrong type', function () {
                var func = function () {
                    return sut.checkActivitySession('string');
                };
                expect(func).toThrow(new SessionError('Parameter session is required and must be a object type!'));
            });

            it('should throw an Error when not given parameter callback', function () {
                var func = function () {
                    return sut.checkActivitySession({});
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should throw an Error when parameter callback is wrong type', function () {
                var func = function () {
                    return sut.checkActivitySession({}, 'string');
                };
                expect(func).toThrow(new SessionError('Parameter callback is required and must be a object type!'));
            });

            it('should be successfully when correct time', function (done) {

                // overwrite sessionStore
                startDate.setMinutes(startDate.getMinutes() - 10);
                activityDate.setMinutes(activityDate.getMinutes() - 5);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                // get session
                sut.getSession(cookie, function (error, session) {

                    expect(error).toBeNull();
                    expect(session._sessionid).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(session.user.name).toBe('guest');

                    // check session activity
                    sut.checkActivitySession(session, function (error, result) {

                        expect(error).toBeNull();
                        expect(result).toBe(true);

                        done();
                    });
                });
            });

            it('should be not successfully when max time exceeded', function (done) {

                // overwrite sessionStore
                startDate.setHours(startDate.getHours() - 12);
                activityDate.setMinutes(activityDate.getMinutes() - 5);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                spyOn(mock.logging.syslog, 'warn');

                // get session
                sut.getSession(cookie, function (error, session) {

                    expect(error).toBeNull();
                    expect(session._sessionid).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(session.user.name).toBe('guest');

                    // overwrite session regenerate
                    session.regenerate = function (callback) {
                        callback(null, false);
                    };

                    // check session activity
                    sut.checkActivitySession(session, function (error, result) {

                        expect(error).toBeNull();
                        expect(result).toBe(false);
                        expect(mock.logging.syslog.warn).toHaveBeenCalledWith('session too long inactive or session expired, regenerate session.');

                        done();
                    });
                });
            });

            it('should be not successfully when active time exceeded', function (done) {

                // overwrite sessionStore
                startDate.setHours(startDate.getHours() - 3);
                activityDate.setHours(activityDate.getHours() - 2);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                spyOn(mock.logging.syslog, 'warn');

                // get session
                sut.getSession(cookie, function (error, session) {

                    expect(error).toBeNull();
                    expect(session._sessionid).toBe('kuXMThISDw9LA7mkEQ0pnOZt');
                    expect(session.user.name).toBe('guest');

                    // overwrite session regenerate
                    session.regenerate = function (callback) {
                        callback(null, false);
                    };

                    // check session activity
                    sut.checkActivitySession(session, function (error, result) {

                        expect(error).toBeNull();
                        expect(result).toBe(false);
                        expect(mock.logging.syslog.warn).toHaveBeenCalledWith('session too long inactive or session expired, regenerate session.');

                        done();
                    });
                });
            });
        });

        describe('Test transport api', function () {

            var sessionStore, startDate, activityDate, cookie, request;

            beforeEach(function () {

                mock = appMock();
                sut = session(mock.baboon);

                sessionStore = sut.getSessionStore();
                startDate = new Date();
                activityDate = new Date();
                cookie = 'baboon.sid=s%3AkuXMThISDw9LA7mkEQ0pnOZt.rtGhLaq%2FeZqAeRk39PFWSaqDKDOnK4ncrst%2BmNOQZ%2F8';
            });

            it('should be setActivity successfully', function (done) {

                // overwrite sessionStore
                startDate.setMinutes(startDate.getMinutes() - 10);
                activityDate.setMinutes(activityDate.getMinutes() - 5);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null, true);
                        },
                        headers: {}
                    };

                    sut.setActivity({}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toBe(true);
                        done();
                    });
                });
            });

            it('should be setActivity not successfully when active time exceeded', function (done) {

                // overwrite sessionStore
                startDate.setHours(startDate.getHours() - 3);
                activityDate.setHours(activityDate.getHours() - 2);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                spyOn(mock.logging.syslog, 'warn');

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    sess.regenerate = function (callback) {
                        callback();
                    };

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null, true);
                        },
                        headers: {}
                    };

                    sut.setActivity({}, request, function(error, result) {

                        expect(error.message).toBe('Session too long inactive or session expired, regenerate session.');
                        expect(result).toBeUndefined();
                        expect(mock.logging.syslog.warn).toHaveBeenCalledWith('session too long inactive or session expired, regenerate session.');
                        done();
                    });
                });
            });

            it('should be setActivity return error by setSession error', function (done) {

                // overwrite sessionStore
                startDate.setHours(startDate.getHours() - 3);
                activityDate.setHours(activityDate.getHours() - 2);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                spyOn(mock.logging.syslog, 'warn');

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    sess.regenerate = function (callback) {
                        callback();
                    };

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null, null);
                        },
                        headers: {}
                    };

                    sut.setActivity({}, request, function(error, result) {

                        expect(error.message).toBe('Unknown session error in setSession');
                        expect(result).toBeUndefined();
                        expect(mock.logging.syslog.warn).toHaveBeenCalledWith('session too long inactive or session expired, regenerate session.');
                        done();
                    });
                });
            });

            it('should be getLastActivity successfully', function (done) {

                // overwrite sessionStore
                startDate.setMinutes(startDate.getMinutes() - 10);
                activityDate.setMinutes(activityDate.getMinutes() - 5);
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getLastActivity({}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result.activity).toBe(activityDate.toISOString());
                        done();
                    });
                });
            });

            it('should be getLastActivity return error when not activity key', function (done) {

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    delete sess.activity;

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getLastActivity({}, request, function(error, result) {
                        expect(error.message).toBe('Property activity not found in session');
                        expect(result).toBeUndefined();
                        done();
                    });
                });
            });

            it('should be getData successfully without key', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getData({}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toEqual({});
                        done();
                    });
                });
            });

            it('should be getData successfully without key and session.data', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    delete sess.data;

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getData({}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toEqual({});
                        done();
                    });
                });
            });

            it('should be getData successfully with key', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    sess.data.testKey = 'testValue';

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getData({key:'testKey'}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toEqual({testKey:'testValue'});
                        done();
                    });
                });
            });

            it('should be getData successfully with not exists key', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    session.data.testKey2 = 'testValue2';

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getData({key:'testKey'}, request, function(error, result) {
                        expect(error.message).toBe('Key: testKey not found in session container');
                        expect(result).toBeUndefined();
                        done();
                    });
                });
            });

            it('should be setData return error when not given key', function (done) {
                sut.setData({}, request, function(error, result) {
                    expect(error.message).toBe('Parameter key is required');
                    expect(result).toBeUndefined();
                    done();
                });
            });

            it('should be setData return error when not given value', function (done) {
                sut.setData({key:'testKey'}, request, function(error, result) {
                    expect(error.message).toBe('Parameter value is required');
                    expect(result).toBeUndefined();
                    done();
                });
            });

            it('should be setData successfully', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null, true);
                        }
                    };

                    sut.setData({key:'testKey', value:'testValue'}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toEqual('testKey is saved in session');
                        done();
                    });
                });
            });

            it('should be setData successfully without session.data', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    delete sess.data;

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null, true);
                        }
                    };

                    sut.setData({key:'testKey', value:'testValue'}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toEqual('testKey is saved in session');
                        done();
                    });
                });
            });

            it('should be setData return error in setSession', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(new SessionError('TestError', 400));
                        }
                    };

                    sut.setData({key:'testKey', value:'testValue'}, request, function(error, result) {
                        expect(error).toBeDefined();
                        expect(error instanceof SessionError).toBe(true);
                        expect(error.status).toBe(400);
                        expect(error.message).toBe('TestError');
                        expect(result).toBeUndefined();
                        done();
                    });
                });
            });

            it('should be setData return unknown error in setSession', function (done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);

                    request = {
                        sessionID: sess.id,
                        session: sess,
                        setSession: function (callback) {
                            callback(null);
                        }
                    };

                    sut.setData({key:'testKey', value:'testValue'}, request, function(error, result) {
                        expect(error).toBeDefined();
                        expect(error instanceof SessionError).toBe(true);
                        expect(error.status).toBe(400);
                        expect(error.message).toBe('Unknown session error in setSession');
                        expect(result).toBeUndefined();
                        done();
                    });
                });
            });

            it('should be deleteData successfully with key', function(done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    sess.data.testKey = 'testValue';

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.deleteData({key:'testKey'}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toBe('testKey is deleted in session');
                        done();
                    });
                });
            });

            it('should be deleteData successfully without session.data', function(done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    delete sess.data;

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.deleteData({key:'testKey'}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toBe('container session.data deleted');
                        done();
                    });
                });
            });

            it('should be deleteData successfully without key', function(done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    sess.data.testKey = 'testValue';

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.deleteData({}, request, function(error, result) {
                        expect(error).toBeNull();
                        expect(result).toBe('container session.data deleted');
                        done();
                    });
                });
            });

            it('should be deleteData return error when key not found', function(done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    sess.data.testKey = 'testValue';

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.deleteData({key:'testKey2'}, request, function(error, result) {
                        expect(error.message).toBe('Key: testKey2 not found in session container');
                        expect(result).toBeUndefined();
                        done();
                    });
                });
            });

            it('should be return correct user data', function(done) {

                // overwrite sessionStore
                sessionStore.sessions = { kuXMThISDw9LA7mkEQ0pnOZt: '{"cookie":{"originalMaxAge":false,"expires":false,"httpOnly":true,"path":"/"},"_sessionid":"kuXMThISDw9LA7mkEQ0pnOZt","activity":"' + activityDate.toISOString() + '","start":"' + startDate.toISOString() + '","data":{},"user":{"id":-1,"name":"guest"}}' };

                sut.getSession(cookie, function (error, session) {

                    var data = {
                        sessionID:'kuXMThISDw9LA7mkEQ0pnOZt',
                        sessionStore: sessionStore
                    };

                    var sess = new Session(data, session);
                    sess.user = {
                        name: 'testUser'
                    };
                    sess.loggedIn = true;

                    request = {
                        sessionID: sess.id,
                        session: sess
                    };

                    sut.getUserDataForClient (null, request, function(error, result) {

                        expect(error).toBeNull();
                        expect(result.isLoggedIn).toBe(true);
                        expect(result.username).toBe('testUser');
                        done();
                    });
                });
            });
        });
    });
});
