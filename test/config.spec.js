'use strict';

describe('Config', function () {


    var path = require('path');
    var config = require(path.resolve(__dirname, '../', 'lib', 'config'));
    var rootPath = path.resolve(__dirname, 'mocks');

    beforeEach(function() {
        spyOn(console, 'log');
        process.env.NODE_ENV = undefined;
    });

    it('should throw an Error when the param "rootPath" is of wrong type', function() {
        var func = function () { return config(2, {});};
        expect(func).toThrow();
    });

    it('should throw an Error when the param "argv" is of wrong type', function() {
        var func = function () { return config(rootPath, 'test');};
        expect(func).toThrow();
    });

    it('should throw an Error when not given params', function() {
        var func = function () { return config();};
        expect(func).toThrow();
    });

    it('should be the correct port in the config', function() {
        var sut = config(rootPath, {port:9999});
        expect(sut.port).toBe(9999);
    });

    it('should be the correct protocol in the config', function() {
        var sut = config(rootPath, {protocol:'https'});
        expect(sut.protocol).toBe('https');
    });

    it('should return the production settings when not given option --config', function() {
        var sut = config(rootPath,{});

        expect(sut.path.root).toBeDefined();
        expect(sut.path.logs).toBeDefined();
        expect(sut.node_env).toBe('production');
        expect(process.env.NODE_ENV).toBe(sut.node_env);
        expect(sut.app_name).toBe('Baboon Example App');
        expect(sut.protocol).toBe('http');
        expect(sut.host).toBe('127.0.0.1');
        expect(sut.port).toBe(3000);
        expect(sut.logging.appenders.file.maxLogSize).toBe(2048000);
        expect(sut.logging.appenders.file.backups).toBe(10);
        expect(sut.logging.appenders.db).toBe('localhost:27017/baboon_logs');
        expect(sut.logging.loggers.audit.active).toBe(true);
        expect(sut.logging.loggers.audit.level).toBe('INFO');
        expect(sut.logging.loggers.audit.appender).toBe('log4js-node-mongodb');
        expect(sut.logging.loggers.syslog.active).toBe(true);
        expect(sut.logging.loggers.syslog.level).toBe('INFO');
        expect(sut.logging.loggers.syslog.appender).toBe('file');
        expect(sut.logging.loggers.express.active).toBe(true);
        expect(sut.logging.loggers.express.level).toBe('INFO');
        expect(sut.logging.loggers.express.appender).toBe('console');
    });
    it('should return the production settings when option --config is production', function() {
        var sut = config(path.join(rootPath),{config:'production'});
        expect(sut.path.root).toBeDefined();
        expect(sut.path.logs).toBeDefined();
        expect(sut.node_env).toBe('production');
        expect(process.env.NODE_ENV).toBe(sut.node_env);
        expect(sut.app_name).toBe('Baboon Example App');
        expect(sut.protocol).toBe('http');
        expect(sut.host).toBe('127.0.0.1');
        expect(sut.port).toBe(3000);
        expect(sut.logging.appenders.file.maxLogSize).toBe(2048000);
        expect(sut.logging.appenders.file.backups).toBe(10);
        expect(sut.logging.appenders.db).toBe('localhost:27017/baboon_logs');
        expect(sut.logging.loggers.audit.active).toBe(true);
        expect(sut.logging.loggers.audit.level).toBe('INFO');
        expect(sut.logging.loggers.audit.appender).toBe('log4js-node-mongodb');
        expect(sut.logging.loggers.syslog.active).toBe(true);
        expect(sut.logging.loggers.syslog.level).toBe('INFO');
        expect(sut.logging.loggers.syslog.appender).toBe('file');
        expect(sut.logging.loggers.express.active).toBe(true);
        expect(sut.logging.loggers.express.level).toBe('INFO');
        expect(sut.logging.loggers.express.appender).toBe('console');
    });
    it('should return the development settings when option --config is development.', function () {
        var sut = config(path.join(rootPath),{config:'development'});
        expect(sut.path.root).toBeDefined();
        expect(sut.path.logs).toBeDefined();
        expect(sut.node_env).toBe('development');
        expect(process.env.NODE_ENV).toBe(sut.node_env);
        expect(sut.app_name).toBe('Baboon Example App');
        expect(sut.protocol).toBe('http');
        expect(sut.host).toBe('127.0.0.1');
        expect(sut.port).toBe(3000);
        expect(sut.logging.appenders.file.maxLogSize).toBe(2048000);
        expect(sut.logging.appenders.file.backups).toBe(10);
        expect(sut.logging.appenders.db).toBe('localhost:27017/baboon_logs');
        expect(sut.logging.loggers.audit.active).toBe(true);
        expect(sut.logging.loggers.audit.level).toBe('DEBUG');
        expect(sut.logging.loggers.audit.appender).toBe('console');
        expect(sut.logging.loggers.syslog.active).toBe(true);
        expect(sut.logging.loggers.syslog.level).toBe('DEBUG');
        expect(sut.logging.loggers.syslog.appender).toBe('console');
        expect(sut.logging.loggers.express.active).toBe(true);
        expect(sut.logging.loggers.express.level).toBe('DEBUG');
        expect(sut.logging.loggers.express.appender).toBe('console');
    });
});