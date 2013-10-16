/*global describe, it, expect, beforeEach */
'use strict';

var path = require('path'),
    appMock = require('../../../fixtures/appMock.js')(),
    rootPath = path.resolve('..', 'baboon'),
    repo = require(path.resolve(rootPath, 'lib', 'rights', 'repositories'))(appMock.config.mongo.rights),
    sut = repo.rights,
    data = null;

beforeEach(function () {
    // test data
    data = {
        name: 'save'
    };
});

describe('Rights repositiory', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('.validate()', function () {
        it('should validate the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('save');

                done();
            });
        });

        it('should validate the data when no options are specified', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('save');

                done();
            });
        });

        it('should valid to false when no data is given', function (done) {
            sut.validate(null, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);

                done();
            });
        });

        it('should valid to false when the data is not valid', function (done) {
            sut.validate({}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);

                done();
            });
        });
    });
});