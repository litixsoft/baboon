angular.module('blog', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/foo', {templateUrl: '/views/blog/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl', ['$scope', 'enterpriseCrew', function () {}]);