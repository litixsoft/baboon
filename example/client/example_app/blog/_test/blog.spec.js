/*global describe, it, expect, beforeEach, inject, runs, waitsFor */
'use strict';

var ctrl, scope, flag, value, service;

describe('blog', function () {
    beforeEach(module('blog'));
    beforeEach(module('lx.socket'));

    // blogCtrl tests
    describe('blogCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxSocket');
            service.emit = function (eventName, data, callback) {
                value = {
                    data: [
                        {title: 'p1', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p2', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p3', content: 'text', created: (new Date()).toUTCString()}
                    ],
                    count: 3
                };
                callback(value);
                flag = true;
            };

            scope = $rootScope.$new();
            ctrl = $controller('blogCtrl', {$scope: scope});
        }));

        it('should be initialized correctly', function () {
            expect(typeof scope.searchPosts).toBe('function');
            expect(typeof scope.getData).toBe('function');
        });

        describe('has a function searchPosts() which', function () {
            it('should find blog post by search value', function () {
                runs(function () {
                    scope.searchPosts('test');
                });

                runs(function () {
                    expect(scope.count).toBe(3);
                });
            });

            it('should find all blog posts', function () {
                runs(function () {
                    scope.searchPosts();
                });

                runs(function () {
                    expect(scope.posts.length).toBe(3);
                    expect(scope.count).toBe(3);
                });
            });
        });

        describe('has a function getData() which', function () {
            it('should find all blog posts', function () {
                runs(function () {
                    scope.getData();
                });

                runs(function () {
                    expect(scope.posts.length).toBe(3);
                    expect(scope.count).toBe(3);
                });
            });

            it('should find all blog posts with paging options', function () {
                runs(function () {
                    scope.getData({skip: 1, limit: 1});
                });

                runs(function () {
                    expect(scope.posts.length).toBe(3);
                    expect(scope.count).toBe(3);
                });
            });
        });
    });

    // postCtrl tests
    describe('postCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $routeParams, $injector) {
            service = $injector.get('lxSocket');
            service.emit = function (eventName, data, callback) {
                if (eventName === 'example/blog/blog/addComment') {
                    value = {
                        data: {content: 'text', userName: 'wayne'}
                    };
                }

                if (eventName === 'example/blog/blog/getPostById') {
                    value = {
                        data: {title: 'p1', content: 'text', created: (new Date()).toUTCString()}
                    };
                }
                callback(value);
                flag = true;
            };

            scope = $rootScope.$new();
            $routeParams.id = 22;
            ctrl = $controller('postCtrl', {$scope: scope});
        }));

        it('should be initialized correctly', function () {
            expect(typeof scope.enterComment).toBe('function');
            expect(typeof scope.saveComment).toBe('function');
        });

        it('should load the blog post if the routeParam id is set', function () {
            waitsFor(function () {
                return scope.post.title.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                expect(scope.post.title).toBe('p1');
                expect(scope.post.content).toBe('text');
                expect(scope.post.comments.length).toBe(0);
            });
        });

        it('should track if the comment input is entered', function () {
            expect(scope.enter).toBeUndefined();

            scope.enterComment(true);

            expect(scope.enter).toBeTruthy();
        });

        it('should save a comment', function () {
            expect(scope.post).toBeDefined();
            expect(scope.post.comments.length).toBe(0);

            runs(function () {
                scope.saveComment(1, {content: 'test', userName: 'wayne'});
            });

            runs(function () {
                expect(scope.post.comments.length).toBe(1);
                expect(Object.keys(scope.newComment).length).toBe(0);
            });
        });

        it('should show server errors', function () {
            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxSocket');
                    service.emit = function (eventName, data, callback) {
                        value = {message: 'server error'};
                        callback(value);
                        flag = true;
                    };

                    scope.saveComment(1, {content: 'test', userName: 'wayne'});
                });
            });

            runs(function () {
                expect(scope.post.comments.length).toBe(0);
                expect(scope.newComment).toBeUndefined();
            });
        });

        it('should show validation errors', function () {
            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxSocket');
                    service.emit = function (eventName, data, callback) {
                        value = {errors: []};
                        callback(value);
                        flag = true;
                    };

                    scope.saveComment(1, {content: 'test', userName: 'wayne'});
                });
            });

            runs(function () {
                expect(scope.post.comments.length).toBe(0);
                expect(scope.newComment).toBeUndefined();
            });
        });
    });
});
