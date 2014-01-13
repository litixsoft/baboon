/*global describe, it, expect, beforeEach*/
describe('Logging', function () {
    'use strict';

    var path = require('path');
    var log4js = require('log4js');
    var fs = require('fs');
    var mockHelper = require('./mocks/mockHelper');
    var rootPath = path.resolve(__dirname, '../');
    var tmpPath = path.resolve(rootPath, 'build', 'tmp');
    var config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config:'unitTest'});
    config.path.logs = tmpPath;
    var log = require(path.resolve(rootPath, 'lib', 'logging'));
    var captureStream = mockHelper.captureStream;
    var trim = mockHelper.trimConsole;


    it('should throw an Error when not given params', function () {
        var func = function () {
            return log();
        };
        expect(func).toThrow();
    });

    it('should throw an Error when the param "config" is of wrong type', function () {
        var func = function () {
            return log('test');
        };
        expect(func).toThrow();
    });

    it('should returns all loggers with different appenders', function () {

        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }

        var sut = log(config);

        expect(sut.audit).toBeDefined();
        expect(sut.syslog).toBeDefined();
        expect(sut.express).toBeDefined();

        // check log4js
        expect(log4js.appenders.file).toBeDefined();
        expect(typeof log4js.appenders.file).toBe('function');
        expect(log4js.appenders.console).toBeDefined();
        expect(typeof log4js.appenders.console).toBe('function');
        expect(log4js.appenders['log4js-node-mongodb']).toBeDefined();
        expect(typeof log4js.appenders['log4js-node-mongodb']).toBe('function');
    });



    it('should write an syslog error in syslog file', function (done) {
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }

        var sut = log(config);
        sut.syslog.error('test');
        expect(sut.syslog).toBeDefined();

        // check folders and files are created
        expect(fs.existsSync(tmpPath)).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/syslog')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/syslog/syslog.log')).toBeTruthy();

        // check log4js
        expect(log4js.appenders.file).toBeDefined();
        expect(typeof log4js.appenders.file).toBe('function');
        expect(log4js.getLogger('syslog').category).toBe('syslog');
        expect(typeof log4js.getLogger('syslog')._events.log).toBe('function');

        setTimeout(function () {
            var syslog = fs.readFileSync(tmpPath + '/syslog/syslog.log', {encoding: 'utf8'});
            expect(syslog.indexOf('[ERROR] syslog - test')).toBeGreaterThan(0);

            done();
        }, 1);
    });

    it('should write an express error in console', function () {

        var sut = log(config);

        // capture console
        var hook = captureStream(process.stdout);

        sut.express.error('test');

        /** @namespace hook.captured */
        var result = hook.captured();
        /** @namespace hook.unhook */
        hook.unhook();

        expect(sut.express).toBeDefined();

        // check log4js
        expect(log4js.appenders.console).toBeDefined();
        expect(typeof log4js.appenders.console).toBe('function');
        expect(log4js.getLogger('express').category).toBe('express');
        expect(typeof log4js.getLogger('express')._events.log).toBe('function');
        var exp = trim(result[0].split('[ERROR]')[1]);
        expect(exp).toBe('express - \u001b[39mtest');
    });

    it('should write a warning to console when express logger is inactive', function () {

        config.logging.loggers.express.active = false;

        // capture console
        var hook = captureStream(process.stdout);

        // load logging
        log(config);

        /** @namespace hook.captured */
        var result = hook.captured();
        /** @namespace hook.unhook */
        hook.unhook();

        var exp = trim(result[0]);
        expect(exp).toBe('\u001b[33m warning - \u001b[39mlogger express is inactive');

        config.logging.loggers.express.active = true;
    });

    describe('Logging Db-Test', function () {


        var lxDb = require('lx-mongodb');
        var db = lxDb.GetDb(config.logging.appenders.db, ['audit']);
        var repo = lxDb.BaseRepo(db.audit);

        // delete db before test
        beforeEach(function (done) {
            repo.remove({}, function () {
                done();
            });
        });

        it('should write an audit error in log db', function (done) {

            // write to log
            var sut = log(config);
            sut.audit.error('This is a error!');

            setTimeout(function () {
                repo.find({}, function (error, result) {
                    expect(error).toBeNull();
                    expect(result.length).toBe(1);
                    expect(result[0].category).toBe('audit');
                    expect(result[0].data).toBe('This is a error!');
                    expect(result[0].level).toEqual({level: 40000, levelStr: 'ERROR'});

                    done();
                });
            }, 100);
        });
        it('should write an audit info in log db', function (done) {

            // write to log
            var sut = log(config);
            sut.audit.info('This is a info!');

            setTimeout(function () {
                repo.find({}, function (error, result) {
                    expect(error).toBeNull();
                    expect(result.length).toBe(1);
                    expect(result[0].category).toBe('audit');
                    expect(result[0].data).toBe('This is a info!');
                    expect(result[0].level).toEqual({level: 20000, levelStr: 'INFO'});

                    done();
                });
            }, 100);
        });
    });
});