/*global describe, it, expect, beforeEach */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    repo = require(appMock.config.path.modules + '/app/blog/repositories')(appMock.config.mongo.blog),
    sut = repo.posts,
    data = null;

beforeEach(function (done) {
    // clear db
    sut.remove({}, function () {done();});

    // test data
    data = {
        title: 'p1',
        content: 'text',
        tags: [
            '5196120cbed6e71007000001', '5196120cbed6e71007000002'
        ]
    };
});

describe('postRepository', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
    });

    describe('has a function validate() which', function () {
        it('should convert the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.title).toBe('p1');
                expect(data.content).toBe('text');
                expect(Array.isArray(data.tags)).toBeTruthy();
                expect(data.tags.length).toBe(2);
                expect(typeof data.tags[0]).toBe('object');

                done();
            });
        });

        it('should convert the data', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.title).toBe('p1');
                expect(data.content).toBe('text');
                expect(Array.isArray(data.tags)).toBeTruthy();
                expect(data.tags.length).toBe(2);
                expect(typeof data.tags[0]).toBe('object');

                done();
            });
        });

        it('should valid to false when no data is given', function (done) {
            sut.validate(null, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(2);

                sut.validate({}, null, function (err, res) {
                    expect(res.valid).toBeFalsy();
                    expect(res.errors.length).toBe(2);

                    done();
                });
            });
        });
    });
});