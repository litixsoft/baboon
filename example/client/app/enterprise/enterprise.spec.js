/*global describe, it, expect, beforeEach, inject, runs, waitsFor */
'use strict';

var ctrl, scope, flag, value, service, dataTmp;
dataTmp = [
    {name: 'p1', description: 'des1'},
    {name: 'p2', description: 'des2'},
    {name: 'p3', description: 'des3'}
];

describe('enterprise', function () {
    beforeEach(module('enterprise'));
    beforeEach(module('mocks'));

    // blogCtrl tests
    describe('enterpriseCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxSocket');
            service.emit = function (eventName, data, callback) {
                value = {
                    data: dataTmp,
                    count: 3
                };
                callback(value);
                flag = true;
            };

            scope = $rootScope.$new();
            ctrl = $controller('enterpriseCtrl', {$scope: scope});
        }));

        it('should be initialized correctly', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                expect(typeof scope.crew).toBe('object');
                expect(typeof scope.msg).toBe('string');
                expect(typeof scope.dbReset).toBe('function');
                expect(scope.crew).toEqual(dataTmp);
            });
        });
        it('should be a database reset', function () {

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                scope.dbReset();
            });

            runs(function () {
                expect(scope.crew).toEqual(dataTmp);
            });
        });

        it('should be a create error message', function () {

            service.emit = function (eventName, data, callback) {
                callback({message: 'Could not create test crew!'});
            };

            waitsFor(function () {
                return scope.crew.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                scope.dbReset();
            });

            runs(function () {
                expect(scope.msg).toBe('Could not create test crew!');
            });
        });


//        describe('has a function searchPosts() which', function () {
//            it('should find blog post by search value', function () {
//                runs(function () {
//                    scope.searchPosts('test');
//                });
//
//                runs(function () {
//                    expect(scope.count).toBe(3);
//                });
//            });
//
//            it('should find all blog posts', function () {
//                runs(function () {
//                    scope.searchPosts();
//                });
//
//                runs(function () {
//                    expect(scope.posts.length).toBe(3);
//                    expect(scope.count).toBe(3);
//                });
//            });
//        });

//        describe('has a function getData() which', function () {
//            it('should find all blog posts', function () {
//                runs(function () {
//                    scope.getData();
//                });
//
//                runs(function () {
//                    expect(scope.posts.length).toBe(3);
//                    expect(scope.count).toBe(3);
//                });
//            });
//
//            it('should find all blog posts with paging options', function () {
//                runs(function () {
//                    scope.getData({skip: 1, limit: 1});
//                });
//
//                runs(function () {
//                    expect(scope.posts.length).toBe(3);
//                    expect(scope.count).toBe(3);
//                });
//            });
//        });
    });

    // postCtrl tests
//    describe('postCtrl', function () {
//        beforeEach(inject(function ($controller, $rootScope, $routeParams, $injector) {
//            service = $injector.get('lxSocket');
//            service.emit = function (eventName, data, callback) {
//                if (eventName === 'example/blog/blog/addComment') {
//                    value = {
//                        data: {description: 'text', userName: 'wayne'}
//                    };
//                }
//
//                if (eventName === 'example/blog/blog/getPostById') {
//                    value = {
//                        data: {name: 'p1', description: 'text', created: (new Date()).toUTCString()}
//                    };
//                }
//                callback(value);
//                flag = true;
//            };
//
//            scope = $rootScope.$new();
//            $routeParams.id = 22;
//            ctrl = $controller('postCtrl', {$scope: scope});
//        }));
//
//        it('should be initialized correctly', function () {
//            expect(typeof scope.enterComment).toBe('function');
//            expect(typeof scope.saveComment).toBe('function');
//        });
//
//        it('should load the blog post if the routeParam id is set', function () {
//            waitsFor(function () {
//                return scope.post.name.length > 0;
//            }, 'Length should be greater than 0', 1000);
//
//            runs(function () {
//                expect(scope.post.name).toBe('p1');
//                expect(scope.post.description).toBe('text');
//                expect(scope.post.comments.length).toBe(0);
//            });
//        });
//
//        it('should track if the comment input is entered', function () {
//            expect(scope.enter).toBeUndefined();
//
//            scope.enterComment(true);
//
//            expect(scope.enter).toBeTruthy();
//        });
//
//        it('should save a comment', function () {
//            expect(scope.post).toBeDefined();
//            expect(scope.post.comments.length).toBe(0);
//
//            runs(function () {
//                scope.saveComment(1, {description: 'test', userName: 'wayne'});
//            });
//
//            runs(function () {
//                expect(scope.post.comments.length).toBe(1);
//                expect(Object.keys(scope.newComment).length).toBe(0);
//            });
//        });
//
//        it('should show server errors', function () {
//            runs(function () {
//                flag = false;
//                inject(function ($injector) {
//                    service = $injector.get('lxSocket');
//                    service.emit = function (eventName, data, callback) {
//                        value = {message: 'server error'};
//                        callback(value);
//                        flag = true;
//                    };
//
//                    scope.saveComment(1, {description: 'test', userName: 'wayne'});
//                });
//            });
//
//            runs(function () {
//                expect(scope.post.comments.length).toBe(0);
//                expect(scope.newComment).toBeUndefined();
//            });
//        });
//
//        it('should show validation errors', function () {
//            runs(function () {
//                flag = false;
//                inject(function ($injector) {
//                    service = $injector.get('lxSocket');
//                    service.emit = function (eventName, data, callback) {
//                        value = {errors: []};
//                        callback(value);
//                        flag = true;
//                    };
//
//                    scope.saveComment(1, {description: 'test', userName: 'wayne'});
//                });
//            });
//
//            runs(function () {
//                expect(scope.post.comments.length).toBe(0);
//                expect(scope.newComment).toBeUndefined();
//            });
//        });
//    });
});
