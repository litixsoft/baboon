/*global describe, it, expect, beforeEach, spyOn */
describe('Config', function () {
    'use strict';

    var path = require('path');
    var rootPath = path.resolve('..', 'baboon');
    var config = require(path.resolve(rootPath, 'lib', 'config.js'));

    beforeEach(function() {
        spyOn(console, 'log');
        process.env.NODE_ENV = undefined;
    });

    it('should return the settings from the conf.json file', function() {
        var sut = config(path.join(rootPath + '/example'));

        expect(sut.path).toBeDefined();
        expect(sut.logging).toBeDefined();
        expect(sut.redis).toBeDefined();
        expect(sut.host).toBeDefined();
        expect(sut.port).toBeDefined();
        expect(sut.mongo.blog).toBeDefined();
        expect(sut.mongo.blog).toContain('blog');
        expect(sut.path.logs).toContain('logs');

        var logsFolder = sut.path.logs.split(path.sep);

        expect(logsFolder[logsFolder.length - 1]).toBe('logs');
        expect(logsFolder[logsFolder.length - 2]).toBe('server');
        expect(logsFolder[logsFolder.length - 3]).toBe('example');

        var appFolder = sut.path.appFolder.split(path.sep);

        expect(appFolder[appFolder.length - 1]).toBe('server');
        expect(appFolder[appFolder.length - 2]).toBe('example');
        expect(appFolder[appFolder.length - 3]).toBe('baboon');

//        expect(console.log).toHaveBeenCalledWith('   info  - setting NODE_ENV environment to: development');
    });

    it('should merge the settings from the conf.json file with the NODE_ENV param', function() {
        process.argv[2] = 'pro';
        var sut = config(path.join(rootPath + '/example'));

        expect(sut.path).toBeDefined();
        expect(sut.node_env).toBe('production');
        expect(sut.logging).toBeDefined();
        expect(sut.redis).toBeDefined();
        expect(sut.host).toBeDefined();
        expect(sut.port).toBeDefined();
        expect(sut.mongo.blog).toBeDefined();
        expect(sut.mongo.blog).toContain('localhost');

        expect(console.log).toHaveBeenCalledWith('   info  - setting process.env.NODE_ENV environment from config to: production');
        expect(console.log).toHaveBeenCalledWith('   info  - override base config with param: pro');
        expect(console.log.calls.length).toEqual(2);
    });

    it('should merge the settings from the conf.json file with the NODE_ENV param', function() {
        process.env.NODE_ENV = 'unitTest';
        var sut = config(path.join(rootPath + '/example'));

        expect(sut.path).toBeDefined();
        expect(sut.node_env).toBe('unitTest');
        expect(sut.logging).toBeDefined();
        expect(sut.redis).toBeDefined();
        expect(sut.host).toBeDefined();
        expect(sut.port).toBeDefined();
        expect(sut.mongo.blog).toBeDefined();
        expect(sut.mongo.blog).toContain('/test_blog?');

        expect(console.log).toHaveBeenCalledWith('   info  - setting config.node_env from environment to: unitTest');
        expect(console.log).toHaveBeenCalledWith('   info  - override base config with param: unitTest');
        expect(console.log.calls.length).toEqual(2);
    });

    it('should merge the settings from the conf.json file with the NODE_ENV param', function() {
        process.argv = ['', '', 'local'];

        var sut = config(path.join(rootPath + '/example'));

        expect(sut.path).toBeDefined();
        expect(sut.logging).toBeDefined();
        expect(sut.redis).toBeDefined();
        expect(sut.host).toBeDefined();
        expect(sut.port).toBeDefined();
        expect(sut.mongo.blog).toBeDefined();
        expect(sut.mongo.blog).toContain('blog');
        expect(sut.path.logs).toContain('logs');

        var logsFolder = sut.path.logs.split(path.sep);

        expect(logsFolder[logsFolder.length - 1]).toBe('logs');
        expect(logsFolder[logsFolder.length - 2]).toBe('.Baboon_Example_App');
        expect(console.log.calls.length).toEqual(2);

        var appFolder = sut.path.appFolder.split(path.sep);

        expect(appFolder[appFolder.length - 1]).toBe('.Baboon_Example_App');
    });
});