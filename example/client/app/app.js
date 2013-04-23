angular.module('app', ['templates-main','$strap.directives', 'ui.bootstrap', 'enterprise', 'blog', 'ui'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .service('socket', function ($rootScope) {
        // test
        $rootScope.test = 'Das ist der Socket Test';
    });