'use strict';

describe('Middleware/Session', function () {

    var path = require('path');

    var rootPath = path.resolve(path.join(__dirname, '../../'));
    //var SessionError = require(path.resolve(path.join(rootPath, 'lib', 'errors'))).SessionError;
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')));
    var session = require(path.resolve(path.join(rootPath, 'lib', 'middleware', 'session')));
    var sut, mock;

    beforeEach(function () {
        spyOn(console, 'log');
        mock = appMock();
        sut = session(mock.baboon);
    });

    it('should be defined session', function () {
        expect(sut).toBeDefined();
        expect(sut.initSession).toBeDefined();
        expect(sut.checkActivitySession).toBeDefined();
    });

    it('should be correct initSession with session.user', function (done) {

        mock.req.session.user = {name: 'guest'};

        sut.initSession(mock.req, {}, function () {
            done();
        });
    });

    it('should be correct initSession without session.user and rights disabled', function (done) {

        sut.initSession(mock.req, {}, function () {
            expect(mock.req.session.user).toEqual({name: 'guest', loggedIn: false});
            expect(mock.req.session.data).toBeDefined();
            expect(console.log).toHaveBeenCalledWith('session is newly, add guest and set new start + activity time.');
            done();
        });
    });

    it('should be correct initSession without session.user and rights enabled', function (done) {

        mock.baboon.config.rights.enabled = true;
        sut = session(mock.baboon);

        sut.initSession(mock.req, {}, function () {
            expect(mock.req.session.user).toEqual({id: 'guest', name: 'guest'});
            expect(mock.req.session.data).toBeDefined();
            expect(console.log).toHaveBeenCalledWith('session is newly, add guest and set new start + activity time.');
            done();
        });
    });

    it('should be error in initSession without session.user and rights enabled', function (done) {

        mock.baboon.config.rights.enabled = true;
        mock.baboon.rights.getUser = function (id, callback) {
            id = null;
            callback('test error');
        };
        sut = session(mock.baboon);

        sut.initSession(mock.req, {}, function (error) {
            expect(mock.req.session.data).toBeDefined();
            expect(error).toBe('test error');

            done();
        });
    });

    it('should be correct activity in checkActivitySession', function (done) {

        sut.checkActivitySession(mock.req, {}, function (error) {
            expect(error).toBeUndefined();

            done();
        });
    });

    it('should be error in checkActivitySession when checkActivitySession return an error', function (done) {

        mock.baboon.session.checkActivitySession = function (session, callback) {
            session = null;
            callback('test error');
        };
        sut = session(mock.baboon);

        sut.checkActivitySession(mock.req, {}, function (error) {
            expect(error).toBe('test error');
            done();
        });
    });

    it('should be correct activity in checkActivitySession when session not active', function (done) {

        mock.baboon.session.checkActivitySession = function (session, callback) {
            session = null;
            callback(null, false);
        };
        sut = session(mock.baboon);

        sut.checkActivitySession(mock.req, {}, function () {
            expect(mock.req.session.user).toEqual({name: 'guest', loggedIn: false});
            expect(mock.req.session.data).toBeDefined();
            expect(console.log).toHaveBeenCalledWith('session is newly, add guest and set new start + activity time.');
            done();
        });
    });
});
