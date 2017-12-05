'use strict';

describe('Navigation', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')));
    var navigation = require(path.resolve(path.join(rootPath, 'lib', 'navigation')));
    var navigationFilePath = path.resolve(path.join(rootPath, 'test', 'mocks', 'navigation'));
    var config = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'config')));
    var conf = config().production();
    var NavigationError = require(path.resolve(path.join(rootPath, 'lib', 'errors'))).NavigationError;
    var sut, sutNot, mock, mockNot, data, request, nav, navArr;


    beforeEach(function () {
        mock = appMock();
        mockNot = appMock();

        mock.baboon.rights.enabled = true;
        mockNot.baboon.rights.enabled = true;

        sut = navigation(navigationFilePath, mock.baboon.rights);
    });

    it('should throw an Error when not given parameter navigationFilePath', function () {

        var rights = {};

        var func = function () {
            return navigation({}, rights);
        };
        expect(func).toThrow(new NavigationError('Parameter navigationFilePath is required and must be a string type!'));
    });

    it('should throw an Error when not given parameter rights', function () {
        conf.rights.enabled = true;
        var func = function () {
            return navigation(navigationFilePath, 'string');
        };
        expect(func).toThrow(new NavigationError('Parameter rights is required and must be a object type!'));
    });

    it('should be all methods defined', function () {
        expect(sut).toBeDefined();
        expect(sut.getTree).toBeDefined();
        expect(sut.getList).toBeDefined();
        expect(sut.getTopList).toBeDefined();
        expect(sut.getSubTree).toBeDefined();
        expect(sut.getSubList).toBeDefined();
    });

    describe('.getTree()', function () {

        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('should return a navigation', function (done) {
            sut.getTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[0];
                expect(nav.title).toBe('HOME');
                expect(nav.children).toBeDefined();
                expect(nav.children.length).toBe(3);
                expect(nav.children[0].title).toBe('LOCALE');

                nav = nav.children[2];
                expect(nav.title).toBe('CONTACT');
                expect(nav.children).toBeDefined();
                expect(nav.children.length).toBe(1);
                expect(nav.children[0].title).toBe('EDIT');

                done();
            });
        });

        it('should return a navigation with param "data.current" = null', function (done) {
            data.current = null;

            sut.getTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[0];
                expect(nav.title).toBe('HOME');
                expect(nav.children).toBeDefined();
                expect(nav.children.length).toBe(3);
                expect(nav.children[0].title).toBe('LOCALE');

                done();
            });
        });
    });

    describe('.getList()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('should return a flat navigation', function (done) {
            sut.getList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(8);

                nav = navArr[1];
                expect(nav.title).toBe('LOCALE');

                done();
            });
        });

        it('should return a flat navigation with param "data.current" = null', function (done) {
            data.current = null;

            sut.getList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(8);

                nav = navArr[1];
                expect(nav.title).toBe('LOCALE');

                done();
            });
        });
    });

    describe('.getTopList()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('should return a navigation only from top level', function (done) {
            sut.getTopList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[1];
                expect(nav.title).toBe('PROJECT1');

                done();
            });
        });

        it('should return a navigation only from top level with param "data.current" = null', function (done) {
            data.current = null;

            sut.getTopList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[1];
                expect(nav.title).toBe('PROJECT1');

                done();
            });
        });

////        describe('.getTopList() with not existing role: Test', function () {
////            beforeEach(function () {
////
////                conf.rights.enabled= true;
////                sut2 = navigation(navigationFilePath, conf);
////                data = mock.req.body;
////                request = mock.req || {};
////                request.session = {
////                    user: {
////                        rolesAsObjects: [{ name: 'Test'}]
////                    }
////                };
////            });
////
////            it('should return a navigation only from top level', function (done) {
////
////                sut2.getTopList(data, request, function (error, result) {
////                    navArr = result;
////                    expect(navArr.length).toBe(1);
////                    nav = navArr[1];
////                    expect(nav).toBeUndefined();
////
////                    done();
////                });
////            });
////        });
//
////        describe('.getTopList() with rights disabled', function () {
////            beforeEach(function () {
////
////                conf.rights.enabled= false;
////                sut2 = navigation(navigationFilePath, conf);
////                data = mock.req.body;
////                request = mock.req || {};
////                request.session = {};
////            });
////
////            it('should return a navigation only from top level', function (done) {
////
////                sut2.getTopList(data, request, function (error, result) {
////                    navArr = result;
////                    expect(navArr.length).toBe(3);
////                    nav = navArr[1];
////                    expect(nav.title).toBe('PROJECT1');
////
////                    done();
////                });
////            });
////        });
//
////        describe('.getTopList() with rights disabled', function () {
////            beforeEach(function () {
////
////                conf.rights.enabled= true;
////                sut2 = navigation(navigationFilePath, conf);
////                data = mock.req.body;
////                data.current = 'admin';
////                request = mock.req || {};
////                request.session = {
////                    user: {
////                        rolesAsObjects: [{ name: 'Test'}]
////                    }
////                };
////            });
////
////            it('should return a navigation only from top level', function (done) {
////
////                sut2.getTree(data, request, function (error, result) {
////                    navArr = result;
////                    expect(navArr.length).toBe(1);
////                    nav = navArr[1];
////                    expect(nav).toBeUndefined();
////
////                    done();
////                });
////            });
////        });
//
    });

    describe('.getSubTree()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('should throw an error if param "data.top" = null', function (done) {
            data.top = null;

            sut.getSubTree(data, null, function (error, result) {

                expect(error).toBeDefined();
                expect(error).toEqual(new NavigationError('Parameter top in body is required!', 400));
                expect(result).toBeUndefined();

                done();
            });
        });

        it('should return a sub navigation from a top level', function (done) {
            data.top = '/';

            sut.getSubTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                done();
            });
        });

        it('should return an empty navigation from a top level which does not exists', function (done) {
            data.top = 'ABC';

            sut.getSubTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('should return the main sub navigation from a top level with param "req.body.current" = null', function (done) {
            data.current = null;
            data.top = '/';

            sut.getSubTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(3);

                nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                done();
            });
        });
    });

    describe('.getSubList()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('should throw an error if param "data.top" = null', function (done) {
            data.top = null;

            sut.getSubList(data, null, function (error, result) {

                expect(error).toBeDefined();
                expect(error).toEqual(new NavigationError('Parameter top in body is required!', 400));
                expect(result).toBeUndefined();

                done();
            });
        });

        it('should return a sub navigation from a top level', function (done) {
            data.top = '/';

            sut.getSubList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(4);

                nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                nav = navArr[4];
                expect(nav).toBeUndefined();

                done();
            });
        });

        it('should return an undefined from a top level which does not exists', function (done) {
            data.top = '/notexists';

            sut.getSubList(data, request, function (error, result) {
                navArr = result;

                expect(navArr).toBeDefined();
                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('should return the main top level including sublist with param "data.current" = null', function (done) {
            data.current = null;
            data.top = '/';

            sut.getSubList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(4);

                nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                nav = navArr[4];
                expect(nav).toBeUndefined();

                done();
            });
        });
    });

    describe('nothing is allowed', function () {

        beforeEach(function () {


            mockNot.baboon.rights.userHasAccessToController = function () {
                return false;
            };
            sutNot = navigation(navigationFilePath, mockNot.baboon.rights);

            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('.getTopList() should not return navigation', function (done) {
            sutNot.getTopList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('.getTree() should not return navigation', function (done) {
            sutNot.getTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('.getList() should not return navigation', function (done) {
            sutNot.getList(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(0);

                done();
            });
        });
    });

    describe('special controller is not allowed', function () {

        beforeEach(function () {
            mockNot.baboon.rights.userHasAccessToController = function (user, controller) {
                if (controller === 'app/main/*') {
                    return false;
                }
                return true;
            };
            sutNot = navigation(navigationFilePath, mockNot.baboon.rights);

            data = mock.req.body;
            request = mock.req || {};
            request.session = {user: {rolesAsObjects: [{name: 'Admin'}]}};
        });

        it('.getTopList() should not return navigation', function (done) {
            sutNot.getTree(data, request, function (error, result) {
                navArr = result;

                expect(navArr.length).toBe(2);

                done();
            });
        });
    });
});