/*global angular*/
angular.module('blog.admin', ['blog.services', 'admin.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog/admin', {templateUrl: 'blog/admin/admin.html', controller: 'adminCtrl'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: 'blog/admin/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: 'blog/admin/editPost.html', controller: 'editPostCtrl'});
    })
    .controller('adminCtrl', ['$scope', 'posts', 'lxPager', function ($scope, posts, lxPager) {
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
        $scope.pager.pageSize = 5;

        $scope.sort = function (field) {
            var oldDirection = $scope.params.sort || -1;

            $scope.params.sortBy = field;
            $scope.params.sort = oldDirection > 0 ? -1 : 1;

            posts.getAllWithCount(getQuery(), callback);
        };

        $scope.$watch('pager.currentPage', function () {
            posts.getAllWithCount(getQuery(), callback);
        });
    }])
    .controller('editPostCtrl', ['$scope', '$routeParams', 'auhtorPosts', 'cache', '$location', function ($scope, $routeParams, auhtorPosts, cache) {
        $scope.master = {};
        $scope.post = {};

        // load post
        if ($routeParams.id) {
            auhtorPosts.getById($routeParams.id, function (result) {
                if (result.success) {
                    $scope.post = result.data;
                    $scope.master = result.data;
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
                        console.log('validation errors');
                        console.log(result.errors);
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            };

            if (post._id) {
                auhtorPosts.update(post, callback);
            } else {
                auhtorPosts.create(post, callback);
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
    }]);