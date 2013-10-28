/*global angular*/
angular.module('blog', ['blog.services', 'blog.filters'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/tpls/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/tpls/post.html', controller: 'blogPostCtrl'});
        $routeProvider.when('/blog/admin', {templateUrl: 'blog/tpls/admin.html'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: 'blog/tpls/editPost.html', controller: 'blogAdminEditPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: 'blog/tpls/editPost.html', controller: 'blogAdminEditPostCtrl'});
    })
    .constant('blog.modulePath', 'example/blog/')
    .controller('blogCtrl', ['$scope', '$log', 'lxTransport', 'appBlogAdminTags', 'blog.modulePath', function ($scope, $log, transport, tags, modulePath) {
        var options = {},
            params = {},
            getData = function () {
                var query = {
                    params: params || {},
                    options: options || {}
                };

                if (typeof params === 'string') {
                    transport.emit(modulePath + 'blog/searchPosts', query, callback);
                } else {
                    params = {};
                    transport.emit(modulePath + 'blog/getAllPostsWithCount', query, callback);
                }
            },
            callback = function (error, result) {
                if (result) {
                    $scope.posts = result.items;
                    $scope.count = result.count;
                } else {
                    $log.error(error);
                }
            };

        $scope.searchPosts = function (value) {
            params = value || {};
            getData();
        };

        $scope.getData = function (pagingOptions) {
            options = pagingOptions || {};
            getData();
        };

        tags.getAll({}, function (error, result) {
            if (result) {
                $scope.tags = result;
            }
        });

        $scope.getData({skip: 0, limit: 10});
    }])
    .controller('blogPostCtrl', ['$scope', '$routeParams', '$log', 'lxTransport', 'blog.modulePath', function ($scope, $routeParams, $log, transport, modulePath) {
        // load post
        if ($routeParams.id) {
            transport.emit(modulePath + 'blog/getPostById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.post = result;
                    $scope.post.comments = $scope.post.comments || [];
//                    $scope.master = result.data;
                } else {
                    $log.error(error);
                }
            });
        }

        $scope.enterComment = function (value) {
            $scope.enter = value;
        };

        $scope.saveComment = function (id, comment) {
            var callback = function (error, result) {
                if (result) {
                    // reset model
                    result.data = result || comment;
                    $scope.post.comments.push(result);
                    $scope.newComment = {};
//                    $scope.master = angular.copy(result.data);
//                    $scope.reset();

//                    $location.path('/blog');
                } else if (error) {
                    if (error.validation) {
                        $log.log('validation errors');
                        $log.log(error.validation);
                    } else {
                        $log.error(error);
                    }
                }
            };

            comment.post_id = id;
            transport.emit(modulePath + 'blog/addComment', comment, callback);
//            if (post._id) {
//                appBlogPosts.update(post, callback);
//            } else {
//                appBlogPosts.create(post, callback);
//            }
        };
    }])
    .controller('blogAdminAdminCtrl', ['$scope', '$log', 'lxTransport', 'lxInlineEdit', '$modal', 'blog.modulePath', function ($scope, $log, transport, lxInlineEdit, $modal, modulePath) {
        $scope.initialPageSize = 10;
        $scope.pagingOptions = {skip: 0, limit: $scope.initialPageSize};
        $scope.sortOpts = {title: 1};

        $scope.getData = function (sortingOptions, pagingOptions) {
            var query = {
                params: {},
                options: {}
            };

            if (pagingOptions) {
                $scope.pagingOptions = pagingOptions;
            }

            if (sortingOptions) {
                $scope.sortOpts = sortingOptions;
            }

            query.options.sort = $scope.sortOpts;
            query.options.skip = $scope.pagingOptions.skip;
            query.options.limit = $scope.pagingOptions.limit;

            transport.emit(modulePath + 'blog/getAllPostsWithCount', query, function (error, result) {
                if (result) {
                    $scope.posts = result.items;
                    $scope.count = result.count;
                } else {
                    $log.error(error);
                }
            });
        };

        $scope.getData();

        var saveCallback = function (error, result) {
            if (result) {
                $scope.inlineEdit.model = null;
            }

            if (error) {
                if (error.validation) {
//                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    $scope.inlineEdit.populateValidation($scope.myForm, error.validation);
                } else {
                    $log.error(result.message);
                }
            }
        };

        ///////////////////////////////////////
        $scope.inlineEdit = lxInlineEdit();

        $scope.save = function (post, form) {
            $scope.myForm = form;
            form.errors = {};

            if (post._id) {
                transport.emit(modulePath + 'blog/updatePost', post, saveCallback);
            }
        };

        $scope.addPostsBadPerformance = function () {
            var data = {};

            for (var i = 0; i < 1000; i++) {
                data = {
                    title: 'Post ' + i,
                    content: 'Content ' + i
                };

                transport.emit(modulePath + 'blog/createPost', data, angular.noop);
            }
        };

        $scope.addPosts = function () {
            transport.emit(modulePath + 'blog/addPosts', angular.noop);
        };

        $scope.openTags = function () {
            $scope.instance = $modal.open({
                backdrop: true, //static, true, false
                modalFade: true,
                controller: 'blogAdminModalCtrl',
                keyboard: false,
                resolve: {},
                templateUrl: 'blog/admin/blogAdminTagsCtrl/myModalContent.html'
            });
        };
    }])
    .controller('blogAdminEditPostCtrl', ['$scope', '$routeParams', 'lxTransport', 'appBlogAdminTags', 'lxForm', '$log', 'blog.modulePath', function ($scope, $routeParams, transport, tags, lxForm, $log, modulePath) {
        $scope.lxForm = lxForm('blog_post', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            transport.emit(modulePath + 'blog/getPostById', {id: $routeParams.id}, function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result);
                } else {
                    $log.error(error);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (error, result) {
                if (result) {
                    $scope.lxForm.setModel(result || model, true);
                    tags.refresh = true;
                }

                if (error) {
                    if (error.validation) {
                        $scope.lxForm.populateValidation($scope.form, error.validation);
                    } else {
                        $log.error(error);
                    }
                }
            };

            if (model._id) {
                transport.emit(modulePath + 'blog/updatePost', model, callback);
            } else {
                transport.emit(modulePath + 'blog/createPost', model, callback);
            }
        };

        tags.getAll({}, function (error, result) {
            if (result) {
                $scope.tags = result;
            }
        });
    }])
    .controller('blogAdminModalCtrl', ['$scope', '$modalInstance', 'appBlogAdminTags', function ($scope, $modalInstance, tags) {
        $scope.modal = {};
        $scope.modal.validationErrors = [];

        tags.getAll({}, function (error, result) {
            if (result) {
                $scope.modal.items = result;
            }
        });

        $scope.modal.save = function (name) {
            tags.createTag({name: name}, function (error, result) {
                $scope.modal.validationErrors = [];

                if (result) {
                    $scope.modal.items.push(result);
                    $scope.modal.name = '';
//                    $scope.modal.validationErrors = [];
                }

                if (error) {
                    if (error.validation) {
                        for (var i = 0; i < error.validation.length; i++) {
                            $scope.modal.validationErrors.push({
                                type: 'error',
                                msg: error.validation[i].property + ' ' + error.validation[i].message
                            });
                        }
                    } else {
                        $scope.modal.validationErrors.push({type: 'error', msg: error});
                    }
                }
            });
        };

        $scope.modal.delete = function (tag) {
            tags.deleteTag(tag._id, function (error, result) {
                if (result) {
                    var index = $scope.modal.items.indexOf(tag);
                    $scope.modal.items.splice(index, 1);
                }

                if (error) {
                    $scope.modal.validationErrors.push({type: 'error', msg: error});
                }
            });
        };

        $scope.modal.close = function () {
            if ($modalInstance) {
                $modalInstance.dismiss('cancel');
            }
        };

        $scope.modal.closeAlert = function (index) {
            $scope.modal.validationErrors.splice(index, 1);
        };
    }]);
