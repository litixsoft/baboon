/*global angular*/
var app = angular.module('app',['enterprise', 'myModule']);
app.config(function ($routeProvider, $locationProvider) {
    'use strict';

    $locationProvider.html5Mode(true);
    $routeProvider.otherwise({redirectTo: '/'});
});
//
app.factory('socket', function ($rootScope) {
    'use strict';

    $rootScope.test = 'Das ist der Socket Test';
});
app.enterprise = angular.module('enterprise',['enterprise.services'])
    .config(function($routeProvider){
        'use strict';

        $routeProvider.when('/',{templateUrl: '/views/enterprise/list.html', controller: 'ListCtrl'});
        $routeProvider.when('/new',{templateUrl: '/views/enterprise/edit.html', controller: 'NewCtrl'});
        $routeProvider.when('/edit/:id',{templateUrl: '/views/enterprise/edit.html', controller: 'EditCtrl'});
    });
app.myModule = angular.module('myModule',[])
    .config(function ($routeProvider) {
        'use strict';

        $routeProvider.when('/foo',{templateUrl: '/views/myModule/foo.html', controller: 'FooCtrl'});
    });