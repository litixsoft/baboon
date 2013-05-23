/*global describe, it, expect, beforeEach */
describe('Logging', function () {
    'use strict';

    var path = require('path'),
        log4js = require('log4js'),
        fs = require('fs'),
        rootPath = path.resolve('..', 'baboon'),
        tmpPath = path.resolve(rootPath, 'build', 'tmp'),
        log = require(path.resolve(rootPath, 'lib', 'logging.js'));

    beforeEach(function(){
        // fs.rmdirSync(tmpPath);
    });

    it('returns console logger if nodeEnv is not "production"', function () {
        var sut = log(tmpPath, 'dev', 20480, 10);

        expect(sut.syslog).toBeDefined();
        expect(sut.audit).toBeDefined();
        expect(sut.socket).toBeDefined();
        expect(sut.express).toBeDefined();
        // expect(fs.existsSync(tmpPath)).toBeFalsy();

        // check log4js
        expect(log4js.appenders.console).toBeDefined();
        expect(typeof log4js.appenders.console).toBe('function');
    });

    it('returns file logger if nodeEnv is set to "production"', function (done) {
        var sut = log(tmpPath, 'production', 20480, 10);

        sut.syslog.error('test');
        sut.audit.info('test');
        sut.socket.warn('test');
        sut.express.debug('test');

        expect(sut.syslog).toBeDefined();
        expect(sut.audit).toBeDefined();
        expect(sut.socket).toBeDefined();
        expect(sut.express).toBeDefined();

        // check folders and files are created
        expect(fs.existsSync(tmpPath)).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/sys')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/sys/sys.log')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/audit')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/audit/audit.log')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/socket')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/socket/socket.log')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/express')).toBeTruthy();
        expect(fs.existsSync(tmpPath + '/express/express.log')).toBeTruthy();

        // check log4js
        expect(log4js.appenders.file).toBeDefined();
        expect(typeof log4js.appenders.file).toBe('function');

        expect(log4js.getLogger('syslog').category).toBe('syslog');
        expect(typeof log4js.getLogger('syslog')._events.log).toBe('function');
        expect(log4js.getLogger('audit').category).toBe('audit');
        expect(typeof log4js.getLogger('audit')._events.log).toBe('function');
        expect(log4js.getLogger('socket').category).toBe('socket');
        expect(typeof log4js.getLogger('socket')._events.log).toBe('function');
        expect(log4js.getLogger('express').category).toBe('express');
        expect(typeof log4js.getLogger('express')._events.log).toBe('function');

        setTimeout(function() {
            var syslog = fs.readFileSync(tmpPath + '/sys/sys.log', {encoding: 'utf8'});
            expect(syslog.indexOf('[ERROR] syslog - test')).toBeGreaterThan(0);

            var audit = fs.readFileSync(tmpPath + '/audit/audit.log', {encoding: 'utf8'});
            expect(audit.indexOf('[INFO] audit - test')).toBeGreaterThan(0);

            var socket = fs.readFileSync(tmpPath + '/socket/socket.log', {encoding: 'utf8'});
            expect(socket.indexOf('[WARN] socket - test')).toBeGreaterThan(0);

            var express = fs.readFileSync(tmpPath + '/express/express.log', {encoding: 'utf8'});
            expect(express.indexOf('[DEBUG] express - test')).toBeGreaterThan(0);

            done();
        }, 1);
    });
});