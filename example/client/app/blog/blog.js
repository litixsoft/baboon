/*global angular*/
angular.module('blog', ['blog.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog', {templateUrl: 'blog/blog.html', controller: 'blogCtrl'});
        $routeProvider.when('/blog/new', {templateUrl: 'blog/createPost.html', controller: 'createPostCtrl'});
        $routeProvider.when('/blog/post/:id', {templateUrl: 'blog/post.html', controller: 'postCtrl'});
    })
    .controller('blogCtrl', ['$scope', 'posts', 'socket', function ($scope, posts) {
        posts.getAll(function (data) {
            $scope.posts = data;
        });
    }])
    .controller('createPostCtrl', ['$scope', 'posts', '$location', 'socket', function ($scope, posts, $location) {
        $scope.post = {
            _id: 99,
            author: 'Wayne 99',
            created: new Date(),
            title: 'Post 99',
            content: 'Content99'
        };

        $scope.save = function () {
            posts.create($scope.post, function() {
                $location.path('/blog');
            });
        };
    }])
    .controller('postCtrl', ['$scope', '$routeParams', 'posts', 'socket', function ($scope, $routeParams, posts) {
        posts.getById($routeParams.id - 1, function (data) {
            $scope.post = data;
        });

        $scope.text = 'sadadad';

        $scope.editmode = false;
        $scope.edit = function(){
            // console.log("edit: "+uid);
            $scope.editmode = true;
        };
        $scope.reset = function(){
            //  console.log("reset: "+uid);
            $scope.editmode = false;
        };
        $scope.save = function(){
            // console.log("save: "+uid);
            $scope.editmode = false;
        };
        $scope.delete = function(){
            // console.log("delete: "+uid);
        };
    }]);
