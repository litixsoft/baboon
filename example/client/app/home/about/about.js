angular.module('home.about', [])

// config home module
    .config(function ($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'home/about/views/about.html', controller: 'aboutCtrl'});
    })
// home controller
    .controller('aboutCtrl', ['$scope', function () {}]);
