/*global describe, it, expect, beforeEach */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    repo = require(appMock.config.path.modules + '/example/enterprise/repositories')(appMock.config.mongo.enterprise),
    sut = repo.crew,
    data = null;

beforeEach(function (done) {
    // clear db
    sut.delete({}, function () {done();});

    // test data
    data = {
        name: 'Picard',
        description: 'Captain'
    };
});

describe('crewRepository', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('has a function validate() which', function () {
        it('should convert the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('Picard');
                expect(data.description).toBe('Captain');

                sut.validate(data, function (err, res) {
                    expect(res.valid).toBeTruthy();
                    expect(res.errors.length).toBe(0);
                    expect(data.name).toBe('Picard');
                    expect(data.description).toBe('Captain');

                    done();
                });
            });
        });

        it('should check if the name is unique', function (done) {
            sut.create(data, function (err, res) {
                expect(res[0].name).toBe('Picard');
                expect(typeof res[0]._id).toBe('object');

                sut.validate({name: 'Picard'}, null, function (err, res) {
                    expect(res.valid).toBeFalsy();
                    expect(res.errors.length).toBe(1);
                    expect(res.errors[0].attribute).toBe('checkName');
                    expect(res.errors[0].message).toBe('name already exists');

                    done();
                });
            });
        });

        it('should not check if the name is unique when updating a crew member', function (done) {
            sut.create(data, function (err, res) {
                expect(res[0].name).toBe('Picard');
                expect(typeof res[0]._id).toBe('object');

                sut.validate({name: 'Picard'}, {isUpdate: true}, function (err, res) {
                    expect(res.valid).toBeFalsy();
                    expect(res.errors.length).toBe(1);

                    sut.validate({wayne: 'Picard'}, {isUpdate: true}, function (err, res) {
                        expect(res.valid).toBeTruthy();
                        expect(res.errors.length).toBe(0);

                        done();
                    });
                });
            });
        });

        it('should valid to false when name is not type string', function (done) {
            sut.validate({name: 1}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);

                done();
            });
        });

        it('should valid to false when description is not type string', function (done) {
            sut.validate({name: 'Picard', description: 1}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);

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
    });
});