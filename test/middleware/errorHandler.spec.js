'use strict';

describe('Middleware/ErrorHandler', function () {

    var path = require('path');
    var errorHandler = require(path.resolve(__dirname, '../../', 'lib', 'middleware', 'errorHandler'));

    it('replace this generated placeholder', function() {
        expect(errorHandler).toBeTruthy();
    });
});
