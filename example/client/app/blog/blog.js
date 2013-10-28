/*global angular*/
angular.module('blog', ['blog.admin', 'blog.filters'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/tpls/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/tpls/post.html', controller: 'blogPostCtrl'});
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
    }]);
