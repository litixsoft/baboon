/*global describe, it, expect, beforeEach, spyOn */
'use strict';

var appMock = require('../../fixtures/serverMock.js')(),
    sut = require(appMock.config.path.controllers).blog(appMock),
    repo = require(appMock.config.path.repositories).blog(appMock.config.mongo.blog),
    post = null,
    comment = null,
    tag = null;

beforeEach(function () {
    // clear db
    repo.posts.delete({}, function () {});
    repo.tags.delete({}, function () {});
    repo.comments.delete({}, function () {});

    spyOn(appMock.logging.audit, 'info');
    spyOn(appMock.logging.syslog, 'error');

    // test data
    post = {
        title: 'p1',
        content: 'text'
    };

    tag = {
        content: 'text',
        email: 'chuck@norris.de'
    };

    comment = {
        content: 'text',
        email: 'chuck@norris.de'
    };
});

describe('Blog Controller', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.getAllPosts).toBe('function');
    });

    describe('has a function createPost() which', function () {
        it('should return errors if the blog post is not valid', function (done) {
            sut.createPost({}, function (res) {
                expect(res).toBeDefined();
                expect(res.errors.length).toBe(2);

                sut.createPost(null, function (res) {
                    expect(res).toBeDefined();
                    expect(res.errors.length).toBe(2);

                    done();
                });
            });
        });

        it('should create a new blog post', function (done) {
            sut.createPost(post, function (res) {
                expect(res).toBeDefined();
                expect(res.data.title).toBe(post.title);
                expect(res.data.content).toBe(post.content);
                expect(typeof res.data.created).toBe('object');

                expect(appMock.logging.audit.info).toHaveBeenCalled();
                expect(appMock.logging.audit.info.calls.length).toBe(1);
                expect(appMock.logging.syslog.error).wasNotCalled();

                done();
            });
        });
    });

    describe('has a function updatePost() which', function () {
        it('should return errors if the blog post is not valid', function (done) {
            sut.createPost(post, function (res) {
                res.data.title = '';

                sut.updatePost(res.data, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.errors.length).toBe(1);

                    sut.updatePost(null, function (res3) {
                        expect(res3).toBeDefined();
                        expect(Object.keys(res3).length).toBe(0);

                        done();
                    });
                });
            });
        });

        it('should update a blog post', function (done) {
            sut.createPost(post, function (res) {
                res.data.title = 'p2';
                res.data.content = 'ttt';
                var id = res.data._id.toHexString();
                res.data._id = id;

                sut.updatePost(res.data, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.data).toBeUndefined();

                    expect(appMock.logging.audit.info).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(2);
                    expect(appMock.logging.syslog.error).wasNotCalled();

                    sut.getPostById({id: id}, function (res3) {
                        expect(res3).toBeDefined();
                        expect(res3.data.title).toBe('p2');
                        expect(res3.data.content).toBe('ttt');
                        expect(typeof res3.data.modified).toBe('object');
                        expect(typeof res3.data.created).toBe('object');

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getAllPosts() which', function () {
        it('should return all blog posts', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text'}, function () {
                    sut.getAllPosts({}, function (res) {
                        expect(res).toBeDefined();
                        expect(res.data.length).toBe(2);

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getAllPostsWithCount() which', function () {
        it('should return all blog posts', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text'}, function () {
                    sut.getAllPostsWithCount({}, function (res) {
                        expect(res).toBeDefined();
                        expect(res.data.length).toBe(2);
                        expect(res.count).toBe(2);

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getPostById() which', function () {
        it('should return a single blog post', function (done) {
            sut.createPost(post, function (res) {
                sut.getPostById({id: res.data._id}, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.data.title).toBe('p1');
                    expect(res2.data.content).toBe('text');

                    done();
                });
            });
        });

        it('should return a single blog post with comments', function (done) {
            sut.createPost(post, function (res) {
                sut.addComment({post_id: res.data._id, content: 'aaa'}, function() {
                    setTimeout(function() {
                        sut.getPostById({id: res.data._id}, function (res2) {
                            expect(res2).toBeDefined();
                            expect(res2.data.title).toBe('p1');
                            expect(res2.data.content).toBe('text');
                            expect(res2.data.comments.length).toBe(1);
                            expect(res2.data.comments[0].content).toBe('aaa');

                            done();
                        });
                    }, 1000);
                });
            });
        });

        it('should return no blog posts if id is empty', function (done) {
            sut.createPost(post, function () {
                sut.getPostById({id: null}, function (res2) {
                    expect(res2).toBeDefined();
                    expect(Object.keys(res2).length).toBe(0);

                    done();
                });
            });
        });
    });
});