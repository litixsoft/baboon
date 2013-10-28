/*global describe, it, expect, beforeEach, inject, runs, waitsFor */
'use strict';

var ctrl, scope, flag, value, service;

describe('blog', function () {
    beforeEach(module('ui.bootstrap.modal'));
    beforeEach(module('blog'));
    beforeEach(module('lx.cache'));
    beforeEach(module('lx.session'));
    beforeEach(module('lx.inlineEdit'));
    beforeEach(module('mocks'));
    beforeEach(module('lx.form'));

    // blogCtrl tests
    describe('blogCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            service = $injector.get('lxTransport');
            service.emit = function (eventName, data, callback) {
                value = {
                    items: [
                        {title: 'p1', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p2', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p3', content: 'text', created: (new Date()).toUTCString()}
                    ],
                    count: 3
                };
                callback(null, value);
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
    describe('blogPostCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $routeParams, $injector) {
            service = $injector.get('lxTransport');
            service.emit = function (eventName, data, callback) {
                if (eventName === 'app/blog/blog/addComment') {
                    value = {
                        content: 'text',
                        userName: 'wayne'
                    };
                }

                if (eventName === 'app/blog/blog/getPostById') {
                    value = {
                        title: 'p1',
                        content: 'text',
                        created: (new Date()).toUTCString()
                    };
                }
                callback(null, value);
                flag = true;
            };

            scope = $rootScope.$new();
            $routeParams.id = 22;
            ctrl = $controller('blogPostCtrl', {$scope: scope});
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
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = 'server error';
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
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = {validation: []};
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

    // adminCtrl tests
    describe('blogAdminAdminCtrl', function () {
        beforeEach(inject(function ($controller, $rootScope, $injector) {
            flag = false;
            service = $injector.get('lxTransport');
            service.emit = function (eventName, data, callback) {
                value = {
                    items: [
                        {title: 'p1', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p2', content: 'text', created: (new Date()).toUTCString()},
                        {title: 'p3', content: 'text', created: (new Date()).toUTCString()}
                    ],
                    count: 3
                };
                callback(null, value);
                flag = true;
            };

            scope = $rootScope.$new();
            ctrl = $controller('blogAdminAdminCtrl', {$scope: scope});
        }));

        it('should be initialized correctly', function () {
            expect(typeof scope.getData).toBe('function');
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

    // editPostCtrl tests
    describe('blogAdminEditPostCtrl', function () {
        beforeEach(inject(function ($controller, $routeParams, $injector) {
            flag = false;
            service = $injector.get('lxTransport');
            service.emit = function (eventName, data, callback) {
                if (eventName === 'app/blog/blog/getAllTags') {
                    value = [
                        {name: 'tag1'},
                        {name: 'tag2'},
                        {name: 'tag3'}
                    ];
                }

                if (eventName === 'app/blog/blog/getPostById') {
                    value = {
                        title: 'p1',
                        content: 'text',
                        created: (new Date()).toUTCString()
                    };
                }
                callback(null, value);
                flag = true;
            };

            scope = {};
            $routeParams.id = 22;
            ctrl = $controller('blogAdminEditPostCtrl', {$scope: scope});
        }));

        it('should have initialized correctly', function () {
            expect(typeof scope.save).toBe('function');
            expect(scope.lxForm).toBeDefined();
        });

        it('should load all tags', function () {
            waitsFor(function () {
                return scope.tags.length > 0;
            }, 'Length should be greater than 0', 1000);

            runs(function () {
                expect(scope.tags.length).toBe(3);
            });
        });

        it('should create a new blog post', function () {
            var post = {
                title: 'p1',
                content: 'text'
            };

            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = data;
                        callback(null, value);
                        flag = true;
                    };

                    scope.save(post);
                });
            });

            runs(function () {
                expect(scope.lxForm.model.title).toBe('p1');
                expect(scope.lxForm.model.content).toBe('text');
            });
        });

        it('should update a new blog post', function () {
            var post = {
                _id: 1,
                title: 'p1',
                content: 'text'
            };

            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = data;
                        callback(null, value);
                        flag = true;
                    };

                    scope.save(post);
                });
            });

            runs(function () {
                expect(scope.lxForm.model.title).toBe('p1');
                expect(scope.lxForm.model.content).toBe('text');
            });
        });

        it('should show validation errors', function () {
            var post = {
                title: 'p1',
                content: 'text'
            };

            scope.form = {
                title: 'aaa'
            };

            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = {validation: [
                            {property: 'title'}
                        ]};
                        callback(value);
                        flag = true;
                    };

                    scope.save(post);
                });
            });

            runs(function () {
                expect(scope.lxForm.model.title).toBe('p1');
            });
        });

        it('should show server errors', function () {
            var post = {
                title: 'p1',
                content: 'text'
            };

            runs(function () {
                flag = false;
                inject(function ($injector) {
                    service = $injector.get('lxTransport');
                    service.emit = function (eventName, data, callback) {
                        value = 'server error';
                        callback(value);
                        flag = true;
                    };

                    scope.save(post);
                });
            });

            runs(function () {
                expect(scope.lxForm.model.title).toBe('p1');
            });
        });
    });

    // tagsCtrl tests
//    describe('blogAdminModalCtrl', function () {
//        beforeEach(inject(function ($controller, $rootScope, $injector) {
//            flag = false;
//            service = $injector.get('lxSocket');
//            service.emit = function (eventName, data, callback) {
//                if (eventName === 'example/blog/blog/getAllTags') {
//                    value = {data: [
//                        {name: 'tag1'},
//                        {name: 'tag2'},
//                        {name: 'tag3'}
//                    ]};
//                }
//
//                if (eventName === 'example/blog/blog/getPostById') {
//                    value = {
//                        data: {title: 'p1', content: 'text', created: (new Date()).toUTCString()}
//                    };
//                }
//
//                if (eventName === 'example/blog/blog/deleteTag') {
//                    value = {
//                        success: 1
//                    };
//                }
//
//                callback(value);
//                flag = true;
//            };
//
//            scope = $rootScope.$new();
//            ctrl = $controller('blogAdminModalCtrl', {$scope: scope, $modalInstance: {}});
//        }));
//
//        it('should be initialized correctly', function () {
//            expect(scope.modal).toBeDefined();
//            expect(Array.isArray(scope.modal.validationErrors)).toBeTruthy();
//            expect(typeof scope.modal.closeAlert).toBe('function');
//            expect(typeof scope.modal.open).toBe('function');
//            expect(typeof scope.modal.save).toBe('function');
//            expect(typeof scope.modal.delete).toBe('function');
//            expect(typeof scope.modal.close).toBe('function');
//        });
//
//        it('should close alert messages', function () {
//            scope.modal.validationErrors = [
//                {type: 'error', msg: 'err1'},
//                {type: 'error', msg: 'err2'},
//                {type: 'error', msg: 'err3'}
//            ];
//
//            scope.modal.closeAlert(1);
//
//            expect(scope.modal.validationErrors.length).toBe(2);
//            expect(scope.modal.validationErrors[0].msg).toBe('err1');
//            expect(scope.modal.validationErrors[1].msg).toBe('err3');
//        });
//
//        it('should open the modal dialog', function () {
//            scope.modal.validationErrors = [
//                {type: 'error', msg: 'err1'},
//                {type: 'error', msg: 'err2'},
//                {type: 'error', msg: 'err3'}
//            ];
//
//            expect(scope.modal.items).toBeUndefined();
//
//            runs(function () {
//                scope.modal.open();
//            });
//
//            runs(function () {
//                expect(scope.modal.validationErrors.length).toBe(0);
//                expect(scope.modal.shouldBeOpen).toBeTruthy();
//                expect(scope.modal.items.length).toBe(3);
//            });
//        });
//
//        it('should close the modal dialog', function () {
//            scope.modal.shouldBeOpen = true;
//
//            runs(function () {
//                scope.modal.close();
//            });
//
//            runs(function () {
//                expect(scope.modal.shouldBeOpen).toBeFalsy();
//            });
//        });
//
//        it('should delete a tag', function () {
//            scope.modal.items = [
//                {name: 'tag1', _id: 1},
//                {name: 'tag2', _id: 2},
//                {name: 'tag3', _id: 3}
//            ];
//
//            runs(function () {
//                scope.modal.delete(scope.modal.items[1]);
//            });
//
//            runs(function () {
//                expect(scope.modal.items.length).toBe(2);
//                expect(scope.modal.items[0].name).toBe('tag1');
//                expect(scope.modal.items[1].name).toBe('tag3');
//            });
//        });
//
//        it('should show a error message when deleting a tag failed', function () {
//            scope.modal.items = [
//                {name: 'tag1', _id: 1},
//                {name: 'tag2', _id: 2},
//                {name: 'tag3', _id: 3}
//            ];
//
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
//                    scope.modal.delete(scope.modal.items[1]);
//                });
//            });
//
//            runs(function () {
//                expect(scope.modal.items.length).toBe(3);
//                expect(scope.modal.validationErrors.length).toBe(1);
//                expect(scope.modal.validationErrors[0].type).toBe('error');
//                expect(scope.modal.validationErrors[0].msg).toBe('server error');
//            });
//        });
//
//        it('should save a tag', function () {
//            scope.modal.items = [
//                {name: 'tag1', _id: 1},
//                {name: 'tag2', _id: 2},
//                {name: 'tag3', _id: 3}
//            ];
//
//            runs(function () {
//                flag = false;
//                inject(function ($injector) {
//                    service = $injector.get('lxSocket');
//                    service.emit = function (eventName, data, callback) {
//                        value = {data: {name: data.name, _id: 99}};
//                        callback(value);
//                        flag = true;
//                    };
//
//                    scope.modal.save('tag99');
//                });
//            });
//
//            runs(function () {
//                expect(scope.modal.items.length).toBe(4);
//                expect(scope.modal.validationErrors.length).toBe(0);
//                expect(scope.modal.name).toBe('');
//            });
//        });
//
//        it('should show an error when save a tag failed', function () {
//            scope.modal.items = [
//                {name: 'tag1', _id: 1},
//                {name: 'tag2', _id: 2},
//                {name: 'tag3', _id: 3}
//            ];
//
//            runs(function () {
//                flag = false;
//                inject(function ($injector) {
//                    service = $injector.get('lxSocket');
//                    service.emit = function (eventName, data, callback) {
//                        value = {errors: [
//                            {property: 'name', message: 'already exists'}
//                        ]};
//                        callback(value);
//                        flag = true;
//                    };
//
//                    scope.modal.save('tag99');
//                });
//            });
//
//            runs(function () {
//                expect(scope.modal.items.length).toBe(3);
//                expect(scope.modal.validationErrors.length).toBe(1);
//                expect(scope.modal.validationErrors[0].type).toBe('error');
//                expect(scope.modal.validationErrors[0].msg).toBe('name already exists');
//            });
//        });
//
//        it('should show a server error when save a tag failed', function () {
//            scope.modal.items = [
//                {name: 'tag1', _id: 1},
//                {name: 'tag2', _id: 2},
//                {name: 'tag3', _id: 3}
//            ];
//
//            runs(function () {
//                flag = false;
//                inject(function ($injector) {
//                    service = $injector.get('lxSocket');
//                    service.emit = function (eventName, data, callback) {
//                        value = {message: 'some random error'};
//                        callback(value);
//                        flag = true;
//                    };
//
//                    scope.modal.save('tag99');
//                });
//            });
//
//            runs(function () {
//                expect(scope.modal.items.length).toBe(3);
//                expect(scope.modal.validationErrors.length).toBe(1);
//                expect(scope.modal.validationErrors[0].type).toBe('error');
//                expect(scope.modal.validationErrors[0].msg).toBe('some random error');
//            });
//        });
//    });
});
