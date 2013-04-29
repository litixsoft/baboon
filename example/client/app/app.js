angular.module('app', ['templates-main', 'app.services', '$strap.directives', 'ui.bootstrap', 'enterprise', 'blog', 'uiexamples', 'ui', 'ngGrid','kendo'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .value('$strap.config', {
        datepicker: {
            format: 'M d, yyyy'
        }
    });
