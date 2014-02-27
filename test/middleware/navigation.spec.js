'use strict';

describe('Middleware/Navigation', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')));
    var navigation = require(path.resolve(path.join(rootPath, 'lib', 'middleware', 'navigation') ));
    var navigationFilePath = path.resolve(path.join(rootPath, 'test', 'mocks', 'navigation'));
    var sut, req, res, mock;

    beforeEach(function() {
        mock = appMock();
        sut = navigation(navigationFilePath);
    });

    it('should be defined navigation', function() {
        expect(sut).toBeDefined();
        expect(sut.getTree).toBeDefined();
        expect(sut.getList).toBeDefined();
        expect(sut.getTopList).toBeDefined();
        expect(sut.getSubTree).toBeDefined();
        expect(sut.getSubList).toBeDefined();
    });

    it('getTree should be return a navigation', function () {

        req = mock.req;
        res = mock.res;

        var navArr = sut.getTree(req, res);
        expect(navArr.length).toBe(3);
        var nav = navArr[0];

        expect(nav.title).toBe('HOME');
        expect(nav.children).toBeDefined();
        expect(nav.children.length).toBe(3);
        expect(nav.children[0].title).toBe('LOCALE');

    });
});
