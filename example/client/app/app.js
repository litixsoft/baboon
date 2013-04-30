angular.module('app', [ 'app.services', 'blog', 'enterprise', 'home', 'uiexamples',
        '$strap.directives', 'ui.bootstrap', 'ui', 'ngGrid', 'kendo'
    ])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {templateUrl: 'home/views/home.html', controller: 'homeCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .value('$strap.config', {
        datepicker: {
            format: 'M d, yyyy'
        }
    });
