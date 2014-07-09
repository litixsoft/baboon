'use strict';

var sut = require('../lib/baboon.js');

beforeEach(function () {

});

describe('baboon', function () {
    it('should export awesome', function () {
        expect(sut.awesome).toBeDefined();
    });
});
