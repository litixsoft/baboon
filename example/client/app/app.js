angular.module('app', ['ui.bootstrap', 'app.services', 'blog', 'enterprise', 'home'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {templateUrl: 'home/views/home.html', controller: 'homeCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
    });
