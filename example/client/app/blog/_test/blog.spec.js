/*global describe, it, expect, beforeEach, inject, runs, waitsFor */
'use strict';

var ctrl, scope, flag, value, service;

describe('blog', function () {
    beforeEach(module('blog'));
    beforeEach(module('baboon.services'));

    // blogCtrl tests
    describe('blogCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('socket');
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
            expect(scope.pager).toBeDefined();
            expect(scope.params).toBeDefined();
            expect(scope.searchPosts).toBeDefined();
        });

        describe('has a function searchPosts() which', function () {
            it('should find blog post by search value', function () {
                runs(function () {
                    scope.searchPosts('test');
                });

                runs(function () {
                    expect(scope.params).toBe('test');
                    expect(scope.posts.length).toBe(3);
                    expect(scope.pager.count).toBe(3);
                });
            });

            it('should find all blog posts', function () {
                runs(function () {
                    scope.searchPosts();
                });

                runs(function () {
                    expect(typeof scope.params).toBe('object');
                    expect(Object.keys(scope.params).length).toBe(0);
                    expect(scope.posts.length).toBe(3);
                    expect(scope.pager.count).toBe(3);
                });
            });
        });

        describe('has a pager which', function () {
            it('should load the blog posts when the pageSize changes', function () {
                runs(function () {
                    scope.$digest();
                    scope.searchValue = 'test';
                    scope.pager.pageSize = 4;
                    scope.$digest();
                });

                runs(function () {
                    expect(scope.posts.length).toBe(3);
                    expect(scope.pager.count).toBe(3);
                });
            });

            it('should load the blog posts when the currentPage changes', function () {
                runs(function () {
                    scope.params = null;
                    scope.pager.currentPage = 2;
                    scope.$digest();
                });

                runs(function () {
                    expect(Object.keys(scope.params).length).toBe(0);
                    expect(scope.posts.length).toBe(3);
                    expect(scope.pager.count).toBe(3);
                });
            });
        });
    });

    // postCtrl tests
    describe('postCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $routeParams, $injector) {
            service = $injector.get('socket');
            service.emit = function (eventName, data, callback) {
                if (eventName === 'blog:addComment') {
                    value = {
                        data: {content: 'text', userName: 'wayne'}
                    };
                }

                if (eventName === 'blog:getPostById') {
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
                    service = $injector.get('socket');
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
                    service = $injector.get('socket');
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
