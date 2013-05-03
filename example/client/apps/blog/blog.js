angular.module('blog', ['templates-blog', 'templates-common', 'ui.bootstrap'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(false);
        $routeProvider.when('/', {templateUrl: 'blog.tpl.html', controller: 'mainCtrl'});
        $routeProvider.when('/blog', {templateUrl: 'blog.tpl.html', controller: 'mainCtrl'});
    })
    .controller('mainCtrl', ['$scope', function ($scope) {
        $scope.title = 'Litixsoft Blog';
    }]);