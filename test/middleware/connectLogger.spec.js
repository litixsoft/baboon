'use strict';

describe('Middleware/ConnectLogger', function () {

    var path = require('path');
    var connectLogger = require(path.resolve(__dirname, '../../', 'lib', 'middleware', 'connectLogger'));

    it('replace this generated placeholder', function() {
        expect(connectLogger).toBeTruthy();
    });
});
