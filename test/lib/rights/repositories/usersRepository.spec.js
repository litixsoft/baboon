/*global describe, it, expect, beforeEach */
'use strict';

var path = require('path'),
    appMock = require('../../../fixtures/appMock.js')(),
    rootPath = path.resolve('..', 'baboon'),
    repo = require(path.resolve(rootPath, 'lib', 'rights', 'repositories'))(appMock.config.mongo.rights),
    sut = repo.users,
    data = null;

beforeEach(function (done) {
    // test data
    data = {
        username: 'wayne',
        email: 'wayne@wat.com',
        roles: [
            '5204cf825dd46a6c15000001'
        ],
        groups: [
            '5204cf825dd46a6c15000001'
        ],
        rights: [
            {
                _id: '5204cf825dd46a6c15000001',
                hasAccess: true
            }
        ],
        password: 'a',
        confirmedPassword: 'a'
    };

    sut.delete({username: data.username}, function () {done();});
});

describe('Users repositiory', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('.validate()', function () {
        it('should validate the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.username).toBe('wayne');
                expect(data.email).toBe('wayne@wat.com');
                expect(data.roles).toEqual([sut.convertId('5204cf825dd46a6c15000001')]);
                expect(data.groups).toEqual([sut.convertId('5204cf825dd46a6c15000001')]);
                expect(data.rights).toEqual([
                    {_id: sut.convertId('5204cf825dd46a6c15000001'), hasAccess: true}
                ]);

                done();
            });
        });

        it('should validate the data when no options are specified', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.username).toBe('wayne');
                expect(data.email).toBe('wayne@wat.com');
                expect(data.roles).toEqual([sut.convertId('5204cf825dd46a6c15000001')]);
                expect(data.groups).toEqual([sut.convertId('5204cf825dd46a6c15000001')]);
                expect(data.rights).toEqual([
                    {_id: sut.convertId('5204cf825dd46a6c15000001'), hasAccess: true}
                ]);

                done();
            });
        });

        it('should valid to false when no data is given', function (done) {
            sut.validate(null, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(2);

                done();
            });
        });

        it('should valid to false when the data is not valid', function (done) {
            sut.validate({roles: ['1', '2']}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(4);
                expect(res.errors[0].property).toBe('email');
                expect(res.errors[0].attribute).toBe('required');
                expect(res.errors[1].property).toBe('roles');
                expect(res.errors[1].attribute).toBe('format');
                expect(res.errors[2].property).toBe('roles');
                expect(res.errors[2].attribute).toBe('format');
                expect(res.errors[3].property).toBe('username');
                expect(res.errors[3].attribute).toBe('required');

                done();
            });
        });

        it('should valid to false when the user username already exists in db', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);

                sut.create(data, function (err, res) {
                    expect(err).toBeNull();
                    expect(res.length).toBe(1);

                    sut.validate({username: data.username}, {}, function (err, res) {
                        expect(res.valid).toBeFalsy();
                        expect(res.errors.length).toBe(2);
                        expect(res.errors[0].property).toBe('email');
                        expect(res.errors[0].attribute).toBe('required');
                        expect(res.errors[1].property).toBe('username');
                        expect(res.errors[1].attribute).toBe('checkName');

                        sut.validate({username: data.username, _id: '5204cf825dd46a6c15000001'}, {}, function (err, res) {
                            expect(res.valid).toBeFalsy();
                            expect(res.errors.length).toBe(2);
                            expect(res.errors[0].property).toBe('email');
                            expect(res.errors[0].attribute).toBe('required');
                            expect(res.errors[1].property).toBe('username');
                            expect(res.errors[1].attribute).toBe('checkName');

                            done();
                        });
                    });
                });
            });
        });
    });
});