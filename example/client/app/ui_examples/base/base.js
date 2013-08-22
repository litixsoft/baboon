/*global angular */

angular.module('ui_app.base', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/ui', {templateUrl: '/ui_examples/base/base.html', controller: 'ui_app.base.baseCtrl'});
        $routeProvider.when('/ui/base', {templateUrl: '/ui_examples/base/base.html', controller: 'ui_app.base.baseCtrl'});
        $routeProvider.when('/ui/md/first', {templateUrl: '/ui_examples/base/docs/first.html', controller: 'ui_app.base.baseCtrl'});
    })
    .controller('ui_app.base.baseCtrl', ['$scope', function ($scope) {
        $scope.title = 'UI-Examples-Base';

        $scope.mdcontent = '###Ueberschrifttest ' +
            '![](http://www.pflegewiki.de/images/3/35/Information_icon.svg)';

        $scope.mdData = [
            {title:'Baboon Installation',route:'/ui/md/first'},
            {title:'Baboon Dingens',route:'/ui/md/second'},
            {title:'Baboon Super',route:'/ui/md/third',children:[
                {title:'Super Doll',route:'/ui/md/quad',children:[
                    {title:'Doll 1',route:'/ui/md/five',icon:'home'},
                    {title:'Doll 2',route:'/ui/md/six',icon:'gear'},
                    {title:'Doll 3',route:'/ui/md/seven',icon:'home'}]
                }]
            },
            {title:'Baboon Toll',route:'/ui/md/eight'}];
    }]);
