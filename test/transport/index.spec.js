/*global describe, it, expect*/
describe('transport/index', function () {
    'use strict';

// Module dependencies.
    var stdio = require('stdio');

// Set command line arguments
    var argv = stdio.getopt({
        'config': {key: 'c', args:1, description: 'Use the specified config section'},
        'port': {args:1, description: 'Use the specified port'},
        'protocol': {args:1, description: 'Use the specified protocol'},
        'livereload': {description: 'Use livereload snippet for client'}
    });

    var path = require('path');
    var rootPath = path.resolve(__dirname, '../', '../', 'lib');
    var baboon = require(path.resolve(rootPath, 'baboon'))(rootPath, argv);

    var transport = require(path.resolve(rootPath, 'transport', 'index'));

    it('should throw an Error when not given params', function () {
        var func = function () {
            return transport();
        };
        expect(func).toThrow();
    });

    it('should throw an Error when not given param options', function () {
        baboon.conig = null;
        var func = function () {
            return transport(baboon);
        };
        expect(func).toThrow();
    });
});