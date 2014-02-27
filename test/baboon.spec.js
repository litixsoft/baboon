'use strict';

describe('Baboon', function () {

    var path = require('path');
    var rootPath = path.resolve(path.join(__dirname, '../'));
    var baboon = require(path.resolve(path.join(rootPath, 'lib', 'baboon') ));

    it('should be defined baboon', function() {
        expect(baboon).toBeTruthy();
    });

//    it('should be initialized correctly', function() {
//        var rootPath = path.join(__dirname, '..', 'lib');
//        var b = baboon(rootPath);
//        expect(b).toBeDefined();
//    });
});
