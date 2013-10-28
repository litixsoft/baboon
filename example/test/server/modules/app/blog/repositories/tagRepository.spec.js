/*global describe, it, expect, beforeEach */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    repo = require(appMock.config.path.modules + '/app/blog/repositories')(appMock.config.mongo.blog),
    sut = repo.tags,
    data = null;

beforeEach(function (done) {
    // clear db
    sut.delete({}, function () {done();});

    // test data
    data = {
        name: 'go'
    };
});

describe('tagRepository', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('has a function validate() which', function () {
        it('should convert the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('go');

                sut.validate(data, function (err, res) {
                    expect(res.valid).toBeTruthy();
                    expect(res.errors.length).toBe(0);
                    expect(data.name).toBe('go');

                    done();
                });
            });
        });

        it('should check if the name is unique', function (done) {
            sut.create(data, function (err, res) {
                expect(res[0].name).toBe('go');
                expect(typeof res[0]._id).toBe('object');

                sut.validate({name: 'go'}, null, function (err, res) {
                    expect(res.valid).toBeFalsy();
                    expect(res.errors.length).toBe(1);
                    expect(res.errors[0].attribute).toBe('checkTagName');
                    expect(res.errors[0].message).toBe('name already exists');

                    done();
                });
            });
        });

        it('should not check if the name is unique when updating a tag', function (done) {
            sut.create(data, function (err, res) {
                expect(res[0].name).toBe('go');
                expect(typeof res[0]._id).toBe('object');

                sut.validate({name: 'go'}, {isUpdate: true}, function (err, res) {
                    expect(res.valid).toBeFalsy();
                    expect(res.errors.length).toBe(1);

                    sut.validate({wayne: 'go'}, {isUpdate: true}, function (err, res) {
                        expect(res.valid).toBeTruthy();
                        expect(res.errors.length).toBe(0);

                        done();
                    });
                });
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