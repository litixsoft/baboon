/*global angular*/
angular.module('blog', ['blog.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/post/new', {templateUrl: 'blog/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/post/edit/:id', {templateUrl: 'blog/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/post.html', controller: 'postCtrl'});
    })
    .controller('blogCtrl', ['$scope', 'posts', 'lxPager', function ($scope, posts, lxPager) {
        var callback = function (result) {
            if (result.success) {
                $scope.posts = result.data;
            } else {
                console.log(result);
            }
        };

        $scope.filter = {};
        $scope.pager = lxPager({filter: $scope.filter, callback:callback, service: posts});
        $scope.pager.getAll();


//        posts.getAll(query, function (result) {
//            if (result.success) {
//                $scope.posts = result.data;
//            } else {
//                console.log(result);
//            }
//        });
    }])
    .controller('editPostCtrl', ['$scope', '$routeParams', 'posts', 'cache', '$location', function ($scope, $routeParams, posts, cache) {
        $scope.master = {};
        $scope.post = {};

        // load post
        if ($routeParams.id) {
            posts.getById($routeParams.id, function (result) {
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
                posts.update(post, callback);
            } else {
                posts.create(post, callback);
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
    }])
    .controller('postCtrl', ['$scope', '$routeParams', 'posts', function ($scope, $routeParams, posts) {
        // load post
        if ($routeParams.id) {
            posts.getById($routeParams.id, function (result) {
                if (result.success) {
                    $scope.post = result.data;
                    $scope.post.comments = $scope.post.comments || [];
//                    $scope.master = result.data;
                } else {
                    console.log(result.message);
                }
            });
        }

        $scope.saveComment = function (id, comment) {
            var callback = function (result) {
                if (result.success) {
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

            posts.addComment(id, comment, callback);
//            if (post._id) {
//                posts.update(post, callback);
//            } else {
//                posts.create(post, callback);
//            }
        };
    }]);
