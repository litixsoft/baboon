/*global angular*/
angular.module('blog.admin', ['blog.services', 'admin.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog/admin', {templateUrl: 'blog/admin/admin.html', controller: 'adminCtrl'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: 'blog/admin/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: 'blog/admin/editPost.html', controller: 'editPostCtrl'});
    })
    .controller('adminCtrl', ['$scope', 'posts', 'lxPager', 'tags', function ($scope, posts, lxPager, tags) {
        var callback = function (result) {
                if (result.success) {
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
                posts.getAllWithCount(getQuery(), callback);
            }
        });

        $scope.$watch('pager.currentPage', function () {
            posts.getAllWithCount(getQuery(), callback);
        });

        $scope.modal = {};
        $scope.modal.validationErrors = [];
        $scope.modal.closeAlert = function (index) {
            $scope.modal.validationErrors.splice(index, 1);
        };
        $scope.modal.open = function () {
            $scope.modal.shouldBeOpen = true;
            $scope.modal.validationErrors = [];

            tags.getAll({}, function (result) {
                if (result.success) {
                    $scope.modal.items = result.data;
                }
            });
        };

        $scope.modal.save = function (name) {
            tags.createTag({name: name}, function (result) {
                if (result.success) {
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
                if (result.success) {
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
    }])
    .controller('editPostCtrl', ['$scope', '$routeParams', 'authorPosts', 'cache', 'tags', '$location', function ($scope, $routeParams, authorPosts, cache, tags) {
        $scope.master = {};
        $scope.post = {};

        // load post
        if ($routeParams.id) {
            authorPosts.getById($routeParams.id, function (result) {
                if (result.success) {
                    $scope.post = result.data;
                    $scope.master = angular.copy(result.data);
                    cache.blog_post = result.data;
                } else {
                    console.log(result.message);
                }
            });
        }

        $scope.save = function (post) {
            var callback = function (result) {
                if (result.success) {
                    // reset model
                    result.data = result.data || post;
                    $scope.master = angular.copy(result.data);
                    $scope.reset();
                    cache.blog_post = {};

//                    $location.path('/blog');
                } else {
                    if (result.errors) {
                        for (var i = 0; i < result.errors.length; i++) {
                            $scope.form[result.errors[i].property].$invalid = true;
                            $scope.form[result.errors[i].property].$dirty = true;
                        }
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            };

            if (post._id) {
                authorPosts.update(post, callback);
            } else {
                authorPosts.create(post, callback);
            }
        };

        $scope.reset = function () {
            $scope.post = angular.copy($scope.master);
            cache.post = $scope.post;
        };

        $scope.isUnchanged = function (post) {
            return angular.equals(post, $scope.master);
        };

        if (cache.blog_post && Object.keys(cache.blog_post).length > 0) {
            $scope.post = cache.blog_post;
            $scope.master = angular.copy($scope.post);
        } else {
            cache.blog_post = $scope.post;
        }

        if (cache.tags && Object.keys(cache.tags).length > 0) {
            $scope.tags = cache.tags;
        } else {
            tags.getAll({}, function (result) {
                if (result.success) {
                    $scope.tags = result.data;
                    cache.tags = result.data;
                }
            });
        }
    }]);