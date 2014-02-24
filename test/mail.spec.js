'use strict';

describe('Mail', function () {
    var path = require('path');
    var fs = require('fs');
    var rootPath = path.resolve(__dirname, '../');
    var emlDir = path.resolve(__dirname, 'eml');
    var configMock = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config:'unitTest'});

    // mail init requires the directory
    if(!fs.existsSync(emlDir) ) {
        fs.mkdirSync(emlDir);
    }

    var mail = require(path.resolve(__dirname, '../', 'lib', 'mail'))(configMock.mail); // {type: 'PICKUP', directory: './test/eml', from: 'from@test.com', to: 'to@test.com'}

    beforeEach(function(done) {
        fs.exists(emlDir, function (exists) {
            if(!exists) {
                fs.mkdir(emlDir, done);
            }
            else {
                done();
            }
        });
    });

    it('should throw an initialization error', function(done)  {
        expect(function() {
            require(path.resolve(__dirname, '../', 'lib', 'mail'))(1);
        }).toThrow('Parameter config is required!');
        done();
    });

    it('should throw an initialization error with wrong transport type', function(done)  {
        expect(function() {
            return require(path.resolve(__dirname, '../', 'lib', 'mail'))({type: 'SES', directory: './eml'});
        }).toThrow('Only SMTP or PICKUP allowed!');

        done();
    });

    it('should set an empty type to SMTP', function(done)  {
        var obj = {type: '', directory: './eml'};
        require(path.resolve(__dirname, '../', 'lib', 'mail'))(obj);
        expect(obj.type).toBe('SMTP');
        done();
    });

    it('should send a normal mail to file system', function(done) {
        var message = {
            from: 'test@test.com',
            to: 'to@test.com',
            subject: 'Unit test',
            text: 'This is a test.',
            html: '<h1>This is a test.</h1>'
        };

        mail.sendMail(message, function (error, result){
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();

            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();

            done();
        });
    });

    it('should send a mail from template to file system', function(done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };
        var templatePath = path.resolve(rootPath, 'test', 'mocks', 'templates');

        mail.sendMailFromTemplate(message, path.resolve(templatePath, 'mail.html'), path.resolve(templatePath, 'mail.txt'), [{key: '{DYNAMIC}', value:'Test value'}], function (error, result){
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();

            done();
        });
    });

    it('should send a mail from template with missing html template to file system', function(done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };
        var templatePath = path.resolve(rootPath, 'test', 'mocks', 'templates', 'mail.txt');

        mail.sendMailFromTemplate(message, null, templatePath, [{key: '{DYNAMIC}', value:'Test value'}], function (error, result){
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();

            done();
        });
    });

    it('should send a mail from template with missing html template to file system', function(done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };
        var templatePath = path.resolve(rootPath, 'test', 'mocks', 'templates', 'mail.html');

        mail.sendMailFromTemplate(message, templatePath, null, [{key: '{DYNAMIC}', value:'Test value'}], function (error, result){
            expect(error).toBe(null);
            expect(result).toBeDefined();
            expect(result.path).toBeDefined();
            var exists = fs.existsSync(result.path);
            expect(exists).toBeTruthy();

            done();
        });
    });

    it('should end with an error because template path is invalid', function(done) {
        var message = { from: 'test@test.com', to: 'to@test.com', subject: 'Unit test' };
        var templatePath = path.resolve(rootPath, 'test', 'mocks', 'templates', 'missing.html');

        mail.sendMailFromTemplate(message, templatePath, null, [{key: '{DYNAMIC}', value:'Test value'}], function (error){
            expect(error).toBeDefined();
            done();
        });
    });

    afterEach(function() {
        if( fs.existsSync(emlDir) ) {
            fs.readdirSync(emlDir).forEach(function(file){
                var curPath = path.resolve(emlDir, file);
                fs.unlinkSync(curPath);
            });
            fs.rmdirSync(emlDir);
        }
    });
});