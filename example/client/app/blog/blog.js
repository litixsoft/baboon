/*global angular*/
angular.module('app.blog', ['app.blog.services', 'app.blog.admin', 'app.blog.filters'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/blog.html', controller: 'appBlogCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/post.html', controller: 'appPostCtrl'});
    })
    .constant('app.blog.modulePath', 'example/blog/')
    .controller('appBlogCtrl', ['$scope', 'appBlogPosts', 'tags', function ($scope, appBlogPosts, tags) {
        var options = {},
            params = {},
            getData = function () {
                var query = {
                    params: params || {},
                    options: options || {}
                };

                if (typeof params === 'string') {
                    appBlogPosts.searchPosts(query, callback);
                } else {
                    params = {};
                    appBlogPosts.getAllWithCount(query, callback);
                }
            },
            callback = function (result) {
                if (result.data) {
                    $scope.posts = result.data;
                    $scope.count = result.count;
                } else {
                    console.log(result);
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

        tags.getAll({}, function (result) {
            if (result.data) {
                $scope.tags = result.data;
            }
        });

        $scope.getData({skip: 0, limit: 5});
    }])
    .controller('appPostCtrl', ['$scope', '$routeParams', 'appBlogPosts', function ($scope, $routeParams, appBlogPosts) {
        // load post
        if ($routeParams.id) {
            appBlogPosts.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.post = result.data;
                    $scope.post.comments = $scope.post.comments || [];
//                    $scope.master = result.data;
                } else {
                    console.log(result.message);
                }
            });
        }

        $scope.enterComment = function (value) {
            $scope.enter = value;
        };

        $scope.saveComment = function (id, comment) {
            var callback = function (result) {
                if (result.data) {
                    // reset model
                    result.data = result.data || comment;
                    $scope.post.comments.push(result.data);
                    $scope.newComment = {};
//                    $scope.master = angular.copy(result.data);
//                    $scope.reset();

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

            appBlogPosts.addComment(id, comment, callback);
//            if (post._id) {
//                appBlogPosts.update(post, callback);
//            } else {
//                appBlogPosts.create(post, callback);
//            }
        };
    }]);
