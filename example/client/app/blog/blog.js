/*global angular*/
angular.module('blog', ['blog.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/new', {templateUrl: 'blog/editPost.html', controller: 'createPostCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/post.html', controller: 'postCtrl'});
    })
    .controller('blogCtrl', ['$scope', 'posts', 'socket', function ($scope, posts) {
        posts.getAll(function (data) {
            $scope.posts = data;
        });

        posts.getAllSocket(function (data) {
            console.dir(data);
        });
    }])
    .controller('createPostCtrl', ['$scope', 'posts', '$location', 'socket', function ($scope, posts) {
        $scope.master = {};

        $scope.save = function (post) {
            posts.create(post, function (result) {
                if (result.success) {
                    // reset model
                    result.data.created = new Date(result.data.created);
                    $scope.master = angular.copy(result.data);
                    $scope.reset();

//                    $location.path('/blog');
                } else {
                    if (result.errors) {
                        console.log('validation errors');
                        console.dir(result.errors);
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            });
        };

        $scope.test = function() {
            $scope.post.created = new Date();
        };

        $scope.reset = function () {
            $scope.post = angular.copy($scope.master);
        };

        $scope.isUnchanged = function (post) {
            return angular.equals(post, $scope.master);
        };

        $scope.reset();
    }])
    .controller('postCtrl', ['$scope', '$routeParams', 'posts', 'socket', function ($scope, $routeParams, posts) {
        posts.getById($routeParams.id - 1, function (data) {
            $scope.post = data;
        });

        $scope.text = 'sadadad';

        $scope.editmode = false;
        $scope.edit = function () {
            // console.log("edit: "+uid);
            $scope.editmode = true;
        };
        $scope.reset = function () {
            //  console.log("reset: "+uid);
            $scope.editmode = false;
        };
        $scope.save = function () {
            // console.log("save: "+uid);
            $scope.editmode = false;
        };
        $scope.delete = function () {
            // console.log("delete: "+uid);
        };
    }]);
