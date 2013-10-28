/*global describe, it, expect, beforeEach, spyOn */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    sut = require(appMock.config.path.modules + '/example/blog').blog(appMock),
    repo = require(appMock.config.path.modules + '/example/blog/repositories')(appMock.config.mongo.blog),
    post = null,
    comment = null,
    tag = null;

beforeEach(function (done) {
    // clear db
    repo.posts.delete({}, function () {
        repo.tags.delete({}, function () {
            repo.comments.delete({}, function () {done();});
        });
    });

    spyOn(appMock.logging.audit, 'info');
    spyOn(appMock.logging.syslog, 'error');

    // test data
    post = {
        title: 'p1',
        content: 'text'
    };

    tag = {
        name: 'litixsoft'
    };

    comment = {
        content: 'text',
        email: 'chuck@norris.de'
    };
});

describe('Blog Controller', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.createPost).toBe('function');
        expect(typeof sut.updatePost).toBe('function');
        expect(typeof sut.getAllPosts).toBe('function');
        expect(typeof sut.getAllPostsWithCount).toBe('function');
        expect(typeof sut.getPostById).toBe('function');
        expect(typeof sut.addComment).toBe('function');
    });

    describe('has a function createPost() which', function () {
        it('should return errors if the blog post is not valid', function (done) {
            sut.createPost({}, function (error, res) {
                expect(error).toBeDefined();
                expect(res).toBeUndefined();
                expect(error.validation.length).toBe(2);

                sut.createPost(null, function (error, res) {
                    expect(error).toBeDefined();
                    expect(res).toBeUndefined();
                    expect(error.validation.length).toBe(2);

                    done();
                });
            });
        });

        it('should create a new blog post', function (done) {
            sut.createPost(post, function (error, res) {
                expect(res).toBeDefined();
                expect(res.title).toBe(post.title);
                expect(res.content).toBe(post.content);
                expect(typeof res.created).toBe('object');

                expect(appMock.logging.audit.info).toHaveBeenCalled();
                expect(appMock.logging.audit.info.calls.length).toBe(1);
                expect(appMock.logging.syslog.error).wasNotCalled();

                done();
            });
        });

        it('should update the tag count if the blog post contains some tags', function (done) {
            repo.tags.create({name: 'angular'}, function (err, res) {
                sut.createPost({title: 'pp', content: 'text', tags: [res[0]._id.toHexString()]}, function (err, res) {
                    expect(res).toBeDefined();
                    expect(res.title).toBe('pp');
                    expect(res.content).toBe('text');
                    expect(typeof res.created).toBe('object');

                    expect(appMock.logging.audit.info).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(1);
                    expect(appMock.logging.syslog.error).wasNotCalled();

                    setTimeout(function () {
                        repo.tags.getAll(function (err, res) {
                            expect(res).toBeDefined();
                            expect(res.length).toBe(1);
                            expect(res[0].name).toBe('angular');
                            expect(res[0].count).toBe(1);
                            done();
                        });
                    }, 1000);
                });
            });
        });
    });

    describe('has a function updatePost() which', function () {
        it('should return errors if the blog post is not valid', function (done) {
            sut.createPost(post, function (err, res) {
                res.title = '';

                sut.updatePost(res, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(2);

                    sut.updatePost(null, function (err, res) {
                        expect(err).toBeUndefined();
                        expect(res).toBeUndefined();

                        done();
                    });
                });
            });
        });

        it('should update a blog post', function (done) {
            sut.createPost(post, function (err, res) {
                res.title = 'p2';
                res.content = 'ttt';
                var id = res._id.toHexString();
                res._id = id;

                sut.updatePost(res, function (err, res2) {
                    expect(res2).toBeDefined();
                    expect(res2).toBe(1);

                    expect(appMock.logging.audit.info).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(2);
                    expect(appMock.logging.syslog.error).wasNotCalled();

                    sut.getPostById({id: id}, function (err, res3) {
                        expect(res3).toBeDefined();
                        expect(res3.title).toBe('p2');
                        expect(res3.content).toBe('ttt');
                        expect(typeof res3.modified).toBe('object');
                        expect(typeof res3.created).toBe('object');

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
                    sut.getAllPosts({}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.length).toBe(2);

                        done();
                    });
                });
            });
        });

        it('should return an error if the param "query" is no object', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text'}, function () {
                    sut.getAllPosts({params: 123}, function (err) {
                        expect(err).toBeDefined();
                        expect(err instanceof TypeError).toBeTruthy();
                        expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

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
                    sut.getAllPostsWithCount({}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.items.length).toBe(2);
                        expect(res.count).toBe(2);

                        done();
                    });
                });
            });
        });

        it('should return an error if the param "query" is no object', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text'}, function () {
                    sut.getAllPostsWithCount({params: 123}, function (err) {
                        expect(err).toBeDefined();
                        expect(err instanceof TypeError).toBeTruthy();
                        expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                        done();
                    });
                });
            });
        });
    });

    describe('has a function searchPosts() which', function () {
        it('should return all blog posts if the filter is empty', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text'}, function () {
                    sut.searchPosts({}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.items.length).toBe(2);
                        expect(res.count).toBe(2);

                        done();
                    });
                });
            });
        });

        it('should return all blog posts if the filtered items are set', function (done) {
            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text2'}, function () {
                    sut.searchPosts({params: 'p2'}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.items.length).toBe(1);
                        expect(res.count).toBe(1);
                        expect(res.items[0].title).toBe('p2');
                        expect(res.items[0].content).toBe('text2');

                        sut.searchPosts({params: '2'}, function (err, res) {
                            expect(res).toBeDefined();
                            expect(res.items.length).toBe(1);
                            expect(res.count).toBe(1);
                            expect(res.items[0].title).toBe('p2');
                            expect(res.items[0].content).toBe('text2');

                            done();
                        });
                    });
                });
            });
        });

        it('should return all blog posts when filtering by tagId', function (done) {
            var tagId = '507f191e810c19729de860ea';

            sut.createPost(post, function () {
                sut.createPost({title: 'p2', content: 'text2', tags: [tagId]}, function () {
                    sut.searchPosts({params: tagId}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.items.length).toBe(1);
                        expect(res.count).toBe(1);
                        expect(res.items[0].title).toBe('p2');
                        expect(res.items[0].content).toBe('text2');
                        expect(res.items[0].tags.length).toBe(1);
                        expect(res.items[0].tags[0].toHexString()).toBe(tagId);

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getPostById() which', function () {
        it('should return a single blog post', function (done) {
            sut.createPost(post, function (err, res) {
                sut.getPostById({id: res._id}, function (err, res2) {
                    expect(res2).toBeDefined();
                    expect(res2.title).toBe('p1');
                    expect(res2.content).toBe('text');

                    done();
                });
            });
        });

        it('should return a single blog post with comments', function (done) {
            sut.createPost(post, function (err, res) {
                sut.addComment({post_id: res._id, content: 'aaa'}, function () {
                    setTimeout(function () {
                        sut.getPostById({id: res._id}, function (err, res2) {
                            expect(res2).toBeDefined();
                            expect(res2.title).toBe('p1');
                            expect(res2.content).toBe('text');
                            expect(res2.comments.length).toBe(1);
                            expect(res2.comments[0].content).toBe('aaa');

                            done();
                        });
                    }, 1000);
                });
            });
        });

        it('should return no blog posts if id is empty', function (done) {
            sut.createPost(post, function () {
                sut.getPostById({id: undefined}, function (err) {
                    expect(err).toBeDefined();
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                    done();
                });
            });
        });

        it('should return no blog posts if data is empty', function (done) {
            sut.createPost(post, function () {
                sut.getPostById(null, function (err) {
                    expect(err).toBeDefined();
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                    done();
                });
            });
        });
    });

    describe('has a function addComment() which', function () {
        it('should add a comment to a blog post', function (done) {
            sut.createPost(post, function (err, res) {
                sut.addComment({post_id: res._id, content: 'aaa'}, function () {
                    setTimeout(function () {
                        sut.getPostById({id: res._id}, function (err, res2) {
                            expect(res2).toBeDefined();
                            expect(res2.title).toBe('p1');
                            expect(res2.content).toBe('text');
                            expect(res2.comments.length).toBe(1);
                            expect(res2.comments[0].content).toBe('aaa');

                            done();
                        });
                    }, 1000);
                });
            });
        });

        it('should validate the comment', function (done) {
            sut.createPost(post, function (err, res) {
                sut.addComment({post_id: res._id, someProp: '123'}, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(1);

                    done();
                });
            });
        });

        it('should validate the comment', function (done) {
            sut.addComment(null, function (err) {
                expect(err).toBeDefined();
                expect(err.validation.length).toBe(1);

                done();
            });
        });
    });

    describe('has a function getAllTags() which', function () {
        it('should return all tags', function (done) {
            sut.createTag(tag, function () {
                sut.createTag({name: 'angular'}, function () {
                    sut.getAllTags({}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.length).toBe(2);

                        done();
                    });
                });
            });
        });
    });

    describe('has a function createTag() which', function () {
        it('should return errors if the tag is not valid', function (done) {
            sut.createTag({}, function (err) {
                expect(err).toBeDefined();
                expect(err.validation.length).toBe(1);

                sut.createTag(null, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(1);

                    done();
                });
            });
        });

        it('should return errors when creating a tag and the tag name already exists', function (done) {
            sut.createTag(tag, function (err, res) {
                expect(res).toBeDefined();

                sut.createTag({name: tag.name}, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(1);
                    expect(err.validation[0].message).toBe('name already exists');

                    done();
                });
            });
        });

        it('should create a new tag', function (done) {
            sut.createTag(tag, function (err, res) {
                expect(res).toBeDefined();
                expect(res.name).toBe(tag.name);
                expect(res._id).toBeDefined();

                expect(appMock.logging.audit.info).toHaveBeenCalled();
                expect(appMock.logging.audit.info.calls.length).toBe(1);
                expect(appMock.logging.syslog.error).wasNotCalled();

                done();
            });
        });
    });

    describe('has a function deleteTag() which', function () {
        it('should delete a tag', function (done) {
            sut.createTag(tag, function (err, res) {
                sut.deleteTag({id: res._id}, function (err, res) {
                    expect(res).toBe(1);

                    sut.getAllTags({}, function (err, res) {
                        expect(res.length).toBe(0);
                        expect(appMock.logging.audit.info).toHaveBeenCalled();
                        expect(appMock.logging.audit.info.calls.length).toBe(2);
                        expect(appMock.logging.syslog.error).wasNotCalled();

                        done();
                    });
                });
            });
        });

        it('should delete nothing when the id is not specified', function (done) {
            sut.createTag(tag, function () {
                sut.deleteTag(null, function (err, res) {
                    expect(res).toBeUndefined();
                    expect(err).toBeNull();

                    sut.getAllTags({}, function (err, res) {
                        expect(res.length).toBe(1);
                        expect(appMock.logging.audit.info).toHaveBeenCalled();
                        expect(appMock.logging.audit.info.calls.length).toBe(1);
                        expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                        done();
                    });
                });
            });
        });
    });
});