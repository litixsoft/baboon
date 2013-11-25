/*global describe, it, expect, beforeEach */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    repo = require(appMock.config.path.modules + '/app/blog/repositories')(appMock.config.mongo.blog),
    sut = repo.comments,
    data = null;

beforeEach(function (done) {
    // clear db
    sut.remove({}, function () {done();});

    // test data
    data = {
        content: 'text',
        email: 'chuck@norris.de'
    };
});

describe('commentRepository', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('has a function validate() which', function () {
        it('should convert the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.content).toBe('text');
                expect(data.email).toBe('chuck@norris.de');

                sut.validate(data, function (err, res) {
                    expect(res.valid).toBeTruthy();
                    expect(res.errors.length).toBe(0);
                    expect(data.content).toBe('text');
                    expect(data.email).toBe('chuck@norris.de');

                    done();
                });
            });
        });

        it('should valid to false when the email is in wrong format', function (done) {
            sut.validate({email: 'go', content: 'ee'}, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);
                expect(res.errors[0].attribute).toBe('format');

                done();
            });
        });

        it('should not valid to false when updating a comment', function (done) {
            sut.insert(data, function (err, res) {
                expect(res[0].content).toBe('text');
                expect(typeof res[0]._id).toBe('object');

                sut.validate({name: 'wayne'}, {isUpdate: true}, function(err, res) {
                    expect(res.valid).toBeTruthy();
                    expect(res.errors.length).toBe(0);

                    done();
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