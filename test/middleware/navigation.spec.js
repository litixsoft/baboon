'use strict';

describe('Middleware/Navigation', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')));
    var navigation = require(path.resolve(path.join(rootPath, 'lib', 'middleware', 'navigation')));
    var navigationFilePath = path.resolve(path.join(rootPath, 'test', 'mocks', 'navigation'));
    var sut, data, request, mock;

    beforeEach(function () {
        mock = appMock();
        sut = navigation(navigationFilePath);
    });

    it('should be defined', function () {
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
        });

        it('should return a navigation', function (done) {
            sut.getTree(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[0];
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

            sut.getTree(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[0];
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
        });

        it('should return a flat navigation', function (done) {
            sut.getList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(7);

                var nav = navArr[1];
                expect(nav.title).toBe('LOCALE');

                done();
            });
        });

        it('should return a flat navigation with param "data.current" = null', function (done) {
            data.current = null;

            sut.getList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(7);

                var nav = navArr[1];
                expect(nav.title).toBe('LOCALE');

                done();
            });
        });
    });

    describe('.getTopList()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
        });

        it('should return a navigation only from top level', function (done) {
            sut.getTopList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[1];
                expect(nav.title).toBe('PROJECT1');

                done();
            });
        });

        it('should return a navigation only from top level with param "data.current" = null', function (done) {
            data.current = null;

            sut.getTopList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[1];
                expect(nav.title).toBe('PROJECT1');

                done();
            });
        });
    });

    describe('.getSubTree()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
        });

        it('should throw an error if param "data.top" = null', function () {
            data.top = null;

            var func = function () {sut.getSubTree(data, null);};
            expect(func).toThrow();
        });

        it('should return a sub navigation from a top level', function (done) {
            data.top = '/';

            sut.getSubTree(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                done();
            });
        });

        it('should return an empty navigation from a top level which does not exists', function (done) {
            data.top = 'ABC';

            sut.getSubTree(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('should return the main sub navigation from a top level with param "req.body.current" = null', function (done) {
            data.current = null;
            data.top = '/';

            sut.getSubTree(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(3);

                var nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                done();
            });
        });
    });

    describe('.getSubList()', function () {
        beforeEach(function () {
            data = mock.req.body;
            request = mock.req || {};
        });

        it('should throw an error if param "data.top" = null', function () {
            data.top = null;

            var func = function () {sut.getSubList(data, null);};
            expect(func).toThrow();
        });

        it('should return a sub navigation from a top level', function (done) {
            data.top = '/';

            sut.getSubList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(4);

                var nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                nav = navArr[3];
                expect(nav.title).toBe('EDIT');

                done();
            });
        });

        it('should return an undefined from a top level which does not exists', function (done) {
            data.top = '/notexists';

            sut.getSubList(data, request, function(error, result){
                var navArr = result;

                expect(navArr).toBeDefined();
                expect(navArr.length).toBe(0);

                done();
            });
        });

        it('should return the main top level including sublist with param "data.current" = null', function (done) {
            data.current = null;
            data.top = '/';

            sut.getSubList(data, request, function(error, result){
                var navArr = result;

                expect(navArr.length).toBe(4);

                var nav = navArr[1];
                expect(nav.title).toBe('ABOUT');

                nav = navArr[3];
                expect(nav.title).toBe('EDIT');

                done();
            });
        });
    });
});
