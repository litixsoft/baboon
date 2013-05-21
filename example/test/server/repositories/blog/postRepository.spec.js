/*global describe, it, expect, beforeEach, spyOn */
'use strict';

var appMock = require('../../../fixtures/serverMock.js')(),
    repo = require(appMock.config.path.repositories).blog(appMock.config.mongo.blog),
    sut = repo.posts,
    post = null;

beforeEach(function () {
    // clear db
    repo.posts.delete({}, function () {});

    spyOn(appMock.logging.audit, 'info');
    spyOn(appMock.logging.syslog, 'error');

    post = {
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
            sut.validate(post, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(post.title).toBe('p1');
                expect(post.content).toBe('text');
                expect(Array.isArray(post.tags)).toBeTruthy();
                expect(post.tags.length).toBe(2);
                expect(typeof post.tags[0]).toBe('object');

                done();
            });
        });
    });
});