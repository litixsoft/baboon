'use strict';

/* global describe, it, expect, beforeEach, afterEach */
describe('Mail', function () {
    var path = require('path');
    var fs = require('fs');
    var rootPath = path.resolve(__dirname, '../');
    var emlDir = path.resolve(__dirname, 'eml');
    var configMock = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'});
    var file = '';
    var mail = null; // require(path.resolve(__dirname, '../', 'lib', 'mail'))(configMock.mail);  // {type: 'PICKUP', directory: './test/eml', from: 'from@test.com', to: 'to@test.com'}

    beforeEach(function (done) {
        if(!fs.existsSync(emlDir)) {
            fs.mkdirSync(emlDir);
        }

        if(mail === null) {
            mail = require(path.resolve(__dirname, '../', 'lib', 'mail'))(configMock.mail);
        }

        done();
    });

    it('should throw an initialization error', function (done) {
        expect(function () {
            require(path.resolve(__dirname, '../', 'lib', 'mail'))(1);
        }).toThrow('Parameter config is required!');

        done();
    });

    it('should throw an initialization error with wrong transport type', function (done) {
        expect(function () {
            return require(path.resolve(__dirname, '../', 'lib', 'mail'))({type: 'SES', directory: './eml'});
        }).toThrow('Only SMTP or PICKUP allowed!');

        done();
    });

    it('should set an empty type to SMTP', function (done) {
        var obj = {type: '', directory: emlDir};
        require(path.resolve(__dirname, '../', 'lib', 'mail'))(obj);
        expect(obj.type).toBe('SMTP');

        done();
    });

    it('should send a normal mail to file system', function (done) {
        var message = {
            from: 'test@test.com',
            to: 'to@test.com',
            subject: 'Unit test',
            text: 'This is a test.',
            html: '<h1>This is a test.</h1>'
        };

        mail.sendMail(message, function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();

            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

    it('should send a normal mail, with default values for to and from, to file system', function (done) {
        var message = {
            subject: 'Unit test',
            text: 'This is a test.',
            html: '<h1>This is a test.</h1>'
        };

        mail.sendMail(message, function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();

            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

     it('should send a mail from template to file system', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        mail.sendMailFromTemplate(message, 'mail.html', 'mail.txt', [{ key: '{DYNAMIC}', value: 'Test value' }], function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

    it('should send a mail from template with missing html template to file system', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        mail.sendMailFromTemplate(message, null, 'mail.txt', [
            {key: '{DYNAMIC}', value: 'Test value'}
        ], function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

    it('should send a mail from template with missing txt template to file system', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        mail.sendMailFromTemplate(message, 'mail.html', null, [
            {key: '{DYNAMIC}', value: 'Test value'}
        ], function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

    it('should send a mail from template, with missing replace value for an existing key, to file system', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        mail.sendMailFromTemplate(message, 'mail.html', 'mail.txt', [
            {key: '{DYNAMIC}', value: null}
        ], function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

    it('should send a mail from template, with missing replace values, to file system', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        mail.sendMailFromTemplate(message, 'mail.html', 'mail.txt', null, function (error, result) {
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();
            file = result.path;

            done();
        });
    });

/*    it('should end with an error because template path is invalid', function (done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };

        expect(function () {
            mail.sendMailFromTemplate(message, 'missing.html', null, [
                {key: '{DYNAMIC}', value: 'Test value'}
            ], function (error) {
                expect(error).toBeDefined();
                done();
            });
        }).toThrow();
        *//*mail.sendMailFromTemplate(message, 'missing.html', null, [
            {key: '{DYNAMIC}', value: 'Test value'}
        ], function (error) {
            expect(error).toBeDefined();
            done();
        });*//*

        done();
    });*/

    afterEach(function () {
        if(fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
});