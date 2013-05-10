/*global angular*/
angular.module('blog', ['blog.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/post/new', {templateUrl: 'blog/post.html', controller: 'postCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/post.html', controller: 'postCtrl'});
    })
    .controller('blogCtrl', ['$scope', 'posts', function ($scope, posts) {
        posts.getAll(function (result) {
            if (result.success) {
                $scope.posts = result.data;
            } else {
                console.log(result);
            }
        });
    }])
    .controller('postCtrl', ['$scope', '$routeParams', 'posts', '$location', function ($scope, $routeParams, posts) {
        $scope.master = {};

        // load post
        if ($routeParams.id) {
            posts.getById($routeParams.id, function (result) {
                if (result.success) {
                    $scope.post = result.data;
                    $scope.master = result.data;
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
        };

        $scope.isUnchanged = function (post) {
            return angular.equals(post, $scope.master);
        };

        $scope.reset();
    }]);
//    .controller('postsssCtrl', ['$scope', '$routeParams', 'posts', function ($scope, $routeParams, posts) {
//        posts.getById($routeParams.id - 1, function (data) {
//            $scope.post = data;
//        });
//
//        $scope.text = 'sadadad';
//
//        $scope.editmode = false;
//        $scope.edit = function () {
//            // console.log("edit: "+uid);
//            $scope.editmode = true;
//        };
//        $scope.reset = function () {
//            //  console.log("reset: "+uid);
//            $scope.editmode = false;
//        };
//        $scope.save = function () {
//            // console.log("save: "+uid);
//            $scope.editmode = false;
//        };
//        $scope.delete = function () {
//            // console.log("delete: "+uid);
//        };
//    }]);
