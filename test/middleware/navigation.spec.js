'use strict';

describe('Middleware/Navigation', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')));
    var navigation = require(path.resolve(path.join(rootPath, 'lib', 'middleware', 'navigation')));
    var navigationFilePath = path.resolve(path.join(rootPath, 'test', 'mocks', '.dist', 'navigation'));
    var sut, req, res, mock;

    beforeEach(function () {
        mock = appMock();
        sut = navigation(navigationFilePath);
    });

    it('should be defined navigation', function () {
        expect(sut).toBeDefined();
        expect(sut.getTree).toBeDefined();
        expect(sut.getList).toBeDefined();
        expect(sut.getTopList).toBeDefined();
        expect(sut.getSubTree).toBeDefined();
        expect(sut.getSubList).toBeDefined();
    });

    describe('getTree', function () {
        it('should return a navigation', function () {
            req = mock.req;
            res = mock.res;

            var navArr = sut.getTree(req, res);
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
        });

        it('should return a navigation with param "req.body.current" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.current = null;

            var navArr = sut.getTree(req, res);
            expect(navArr.length).toBe(3);

            var nav = navArr[0];
            expect(nav.title).toBe('HOME');
            expect(nav.children).toBeDefined();
            expect(nav.children.length).toBe(3);
            expect(nav.children[0].title).toBe('LOCALE');
        });
    });

    describe('getList', function () {
        it('should return a flat navigation', function () {
            req = mock.req;
            res = mock.res;

            var navArr = sut.getList(req, res);
            expect(navArr.length).toBe(7);

            var nav = navArr[1];
            expect(nav.title).toBe('LOCALE');
        });

        it('should return a flat navigation with param "req.body.current" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.current = null;

            var navArr = sut.getList(req, res);
            expect(navArr.length).toBe(7);

            var nav = navArr[1];
            expect(nav.title).toBe('LOCALE');
        });
    });

    describe('getTopList', function () {
        it('should return a navigation only from top level', function () {
            req = mock.req;
            res = mock.res;

            var navArr = sut.getTopList(req, res);
            expect(navArr.length).toBe(3);

            var nav = navArr[1];
            expect(nav.title).toBe('PROJECT1');
        });

        it('should return a navigation only from top level with param "req.body.current" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.current = null;

            var navArr = sut.getTopList(req, res);
            expect(navArr.length).toBe(3);

            var nav = navArr[1];
            expect(nav.title).toBe('PROJECT1');
        });
    });

    describe('getSubTree', function () {
        it('should throw an error if param "req.body.top" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = null;

            var func = function () {sut.getSubTree(req, res);};
            expect(func).toThrow();
        });

        it('should return a sub navigation from a top level', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = 'HOME';

            var navArr = sut.getSubTree(req, res);
            expect(navArr.length).toBe(3);

            var nav = navArr[1];
            expect(nav.title).toBe('ABOUT');
        });

        it('should return an empty navigation from a top level which does not exists', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = 'ABC';

            var navArr = sut.getSubTree(req, res);
            expect(navArr.length).toBe(0);
        });

        it('should return the main sub navigation from a top level with param "req.body.current" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.current = null;

            var navArr = sut.getSubTree(req, res);
            expect(navArr.length).toBe(0);
        });
    });

    describe('getSubList', function () {
        it('should throw an error if param "req.body.top" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = null;

            var func = function () {sut.getSubList(req, res);};
            expect(func).toThrow();
        });

        it('should return a sub navigation from a top level', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = 'HOME';

            var navArr = sut.getSubList(req, res);
            expect(navArr.length).toBe(4);

            var nav = navArr[1];
            expect(nav.title).toBe('ABOUT');

            nav = navArr[3];
            expect(nav.title).toBe('EDIT');
        });

        it('should return an undefined from a top level which does not exists', function () {
            req = mock.req;
            res = mock.res;

            req.body.top = 'ABC';

            var navArr = sut.getSubList(req, res);
            expect(navArr).toBeUndefined();
        });

        it('should return an undefined from a top level with param "req.body.current" = null', function () {
            req = mock.req;
            res = mock.res;

            req.body.current = null;

            var navArr = sut.getSubList(req, res);
            expect(navArr).toBeUndefined();
        });
    });
});
