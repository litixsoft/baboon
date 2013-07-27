/*global angular */

angular.module('ui_app.base', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/ui', {templateUrl: '/ui_examples/base/base.html', controller: 'ui_app.base.baseCtrl'});
        $routeProvider.when('/ui/base', {templateUrl: '/ui_examples/base/base.html', controller: 'ui_app.base.baseCtrl'});
    })
    .controller('ui_app.base.baseCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-Base';
    }]);
