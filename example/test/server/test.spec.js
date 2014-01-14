
'use strict';

describe('test', function() {

    var foo = require('../../src/server/controllers/foo');

    it('should be true', function () {
        var sut = foo.test('timo');
        expect('hallo timo').toBe(sut.test);
    });
});