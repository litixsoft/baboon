angular.module('blog', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/foo', {templateUrl: 'blog/blog.html', controller: 'fooCtrl'});
    })
    .controller('fooCtrl', ['$scope', 'enterpriseCrew', function () {}]);