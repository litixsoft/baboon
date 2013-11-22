/*global describe, it, expect, beforeEach */
'use strict';

var path = require('path'),
    appMock = require('../../../fixtures/appMock.js')(),
    rootPath = path.resolve('..', 'baboon'),
    repo = require(path.resolve(rootPath, 'lib', 'repositories'))(appMock.config.mongo.rights),
    sut = repo.roles,
    data = null;

beforeEach(function (done) {
    // test data
    data = {
        name: 'Admin',
        description: 'wayne',
        rights: [
            '5204cf825dd46a6c15000001',
            '5204cf825dd46a6c15000002'
        ]
    };

    sut.remove({name: data.name}, function () {done();});
});

describe('Roles repositiory', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('.validate()', function () {
        it('should validate the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('Admin');
                expect(data.description).toBe('wayne');
                expect(data.rights).toEqual([sut.convertId('5204cf825dd46a6c15000001'), sut.convertId('5204cf825dd46a6c15000002')]);

                done();
            });
        });

        it('should validate the data when no options are specified', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('Admin');
                expect(data.description).toBe('wayne');
                expect(data.rights).toEqual([sut.convertId('5204cf825dd46a6c15000001'), sut.convertId('5204cf825dd46a6c15000002')]);

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
            sut.validate({rights: ['1', '2']}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(3);
                expect(res.errors[0].property).toBe('name');
                expect(res.errors[0].attribute).toBe('required');
                expect(res.errors[1].property).toBe('rights');
                expect(res.errors[1].attribute).toBe('format');
                expect(res.errors[2].property).toBe('rights');
                expect(res.errors[2].attribute).toBe('format');

                done();
            });
        });

        it('should valid to false when the role name already exists in db', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);

                sut.insert(data, function (err, res) {
                    expect(err).toBeNull();
                    expect(res.length).toBe(1);

                    sut.validate({name: data.name}, {}, function (err, res) {
                        expect(res.valid).toBeFalsy();
                        expect(res.errors.length).toBe(1);
                        expect(res.errors[0].property).toBe('name');
                        expect(res.errors[0].attribute).toBe('Name');

                        sut.validate({name: data.name, _id: '5204cf825dd46a6c15000001'}, {}, function (err, res) {
                            expect(res.valid).toBeFalsy();
                            expect(res.errors.length).toBe(1);
                            expect(res.errors[0].property).toBe('name');
                            expect(res.errors[0].attribute).toBe('Name');

                            done();
                        });
                    });
                });
            });
        });
    });
});