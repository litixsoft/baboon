/*global angular*/
angular.module('blog', ['blog.services', 'blog.directives', 'blog.admin'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: '/blog/blog.html', controller: 'blogCtrl'});
//        $routeProvider.when('/blog/post/new', {templateUrl: 'blog/editPost.html', controller: 'editPostCtrl'});
//        $routeProvider.when('/blog/post/edit/:id', {templateUrl: 'blog/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: '/blog/post.html', controller: 'postCtrl'});
    })
    .controller('blogCtrl', ['$scope', 'posts', 'lxPager', function ($scope, posts, lxPager) {
        var getData = function () {
                var query = {
                    params: $scope.params || {},
                    options: $scope.pager.getOptions()
                };

                if ($scope.searchValue) {
                    posts.searchPosts(query, callback);
                } else {
                    $scope.params = {};
                    posts.getAllWithCount(query, callback);
                }
            },
            callback = function (result) {
                if (result.success) {
                    $scope.posts = result.data;
                    $scope.pager.count = result.count;
                } else {
                    console.log(result);
                }
            };

        $scope.params = {};
        $scope.pager = lxPager();
        $scope.searchPosts = function (value) {
            $scope.params = value || {};

            var query = {
                params: $scope.params || {},
                options: $scope.pager.getOptions()
            };

            posts.searchPosts(query, callback);
        };

        $scope.$watch('pager.currentPage', function () {
            getData();
        });

        $scope.$watch('pager.pageSize', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                getData();
            }
        });
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

        $scope.enterComment = function (value) {
            $scope.enter = value;
        };

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
