/*global angular*/
angular.module('blog.admin', ['blog.services', 'admin.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog/admin', {templateUrl: '/blog/admin/admin.html'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: '/blog/admin/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: '/blog/admin/editPost.html', controller: 'editPostCtrl'});
    })
    .controller('adminCtrl', ['$scope', 'posts', 'lxPager', function ($scope, posts, lxPager) {
        var callback = function (result) {
                if (result.data) {
                    $scope.posts = result.data;
                    $scope.pager.count = result.count;
                } else {
                    console.log(result);
                }
            },
            getQuery = function () {
                var query = {
                    params: $scope.params.filter || {},
                    options: $scope.pager.getOptions()
                };

                query.options.sortBy = $scope.params.sortBy || 'created';
                query.options.sort = $scope.params.sort || -1;

                return query;
            };

        $scope.params = {};
//        $scope.pager = lxPager({params: $scope.params, callback:callback, service: posts});
        $scope.pager = lxPager();
        //$scope.pager.pageSize = 5;

        $scope.sort = function (field) {
            var oldDirection = $scope.params.sort || -1;

            $scope.params.sortBy = field;
            $scope.params.sort = oldDirection > 0 ? -1 : 1;

            posts.getAllWithCount(getQuery(), callback);
        };

        $scope.$watch('pager.pageSize', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.pager.currentPage = 1;
            }
        });

        $scope.$watch('pager.currentPage', function () {
            posts.getAllWithCount(getQuery(), callback);
        });
    }])
    .controller('editPostCtrl', ['$scope', '$routeParams', 'authorPosts', 'cache', 'tags', 'lxForm', '$location', function ($scope, $routeParams, authorPosts, cache, tags, lxForm) {
        $scope.lxForm = lxForm('blog_post');

        if (!$scope.lxForm.loadFromCache($routeParams.id)) {
            authorPosts.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    console.log(result.message);
                }
            });
        }

//        // load post
//        if ($routeParams.id) {
//            if (cache.blog_post && cache.blog_post._id === $routeParams.id) {
//                console.log('from cache');
//                $scope.post = cache.blog_post;
//
//                if (cache.blog_post_master && cache.blog_post_master._id === $routeParams.id) {
//                    $scope.master = cache.blog_post_master;
//                }
//
////                if (Object.keys($scope.master).length === 0) {
////                    $scope.master = angular.copy($scope.post);
////                }
//            } else {
//                authorPosts.getById($routeParams.id, function (result) {
//                    if (result.success) {
//                        $scope.post = result.data;
//                        $scope.master = angular.copy(result.data);
//                        cache.blog_post = result.data;
//                        cache.blog_post_master = $scope.master;
//                    } else {
//                        console.log(result.message);
//                    }
//                });
//            }
//        } else {
//            if (cache.blog_post && Object.keys(cache.blog_post).length > 0 && !cache.blog_post._id) {
//                console.log('from cache');
//                $scope.post = cache.blog_post;
//
////                if ($routeParams.id) {
////                    $scope.master = angular.copy($scope.post);
////                }
//            } else {
//                cache.blog_post = $scope.post;
//            }
//        }

        $scope.save = function (model) {
            var callback = function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data || model, true);

//                    $location.path('/blog');
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
//                        for (var i = 0; i < result.errors.length; i++) {
//                            $scope.form[result.errors[i].property].$invalid = true;
//                            $scope.form[result.errors[i].property].$dirty = true;
//                        }
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            };

            if (model._id) {
                authorPosts.update(model, callback);
            } else {
                authorPosts.create(model, callback);
            }
        };

//        $scope.reset = function () {
//            $scope.post = angular.copy($scope.master);
//            cache.post = $scope.post;
//        };
//
//        $scope.isUnchanged = function (post) {
//            return angular.equals(post, $scope.master);
//        };
//
//        if (cache.blog_post && Object.keys(cache.blog_post).length > 0) {
//            $scope.post = cache.blog_post;
//
//            if ($routeParams.id) {
//                $scope.master = angular.copy($scope.post);
//            }
//        } else {
//            cache.blog_post = $scope.post;
//        }

        tags.getAll({}, function (result) {
            if (result.data) {
                $scope.tags = result.data;
//                cache.tags = result.data;
            }
        });
    }])
    .controller('tagsCtrl', ['$scope', 'tags', function ($scope, tags) {
        $scope.modal = {};
        $scope.modal.validationErrors = [];
        $scope.modal.closeAlert = function (index) {
            $scope.modal.validationErrors.splice(index, 1);
        };

        $scope.modal.open = function () {
            $scope.modal.shouldBeOpen = true;
            $scope.modal.validationErrors = [];

            tags.getAll({}, function (result) {
                if (result.data) {
                    $scope.modal.items = result.data;
                }
            });
        };

        $scope.modal.save = function (name) {
            tags.createTag({name: name}, function (result) {
                if (result.data) {
                    $scope.modal.items.push(result.data);
                    $scope.modal.name = '';
                    $scope.modal.validationErrors = [];
                }

                if (result.errors) {
                    for (var i = 0; i < result.errors.length; i++) {
                        $scope.modal.validationErrors.push({
                            type: 'error',
                            msg: result.errors[i].property + ' ' + result.errors[i].message
                        });
                    }
                }

                if (result.message) {
                    $scope.modal.validationErrors.push({type: 'error', msg: result.message});
                }
            });
        };

        $scope.modal.delete = function (tag) {
            tags.deleteTag(tag._id, function (result) {
                if (result.data) {
                    var index = $scope.modal.items.indexOf(tag);
                    $scope.modal.items.splice(index, 1);
                }

                if (result.message) {
                    $scope.modal.validationErrors.push({type: 'error', msg: result.message});
                }
            });
        };

        $scope.modal.close = function () {
            $scope.modal.shouldBeOpen = false;
        };

        $scope.modal.opts = {
            backdropFade: true,
            dialogFade: true
        };
    }]);