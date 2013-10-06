/*global angular */

angular.module('base', [])

    .config(function ($routeProvider) {
        $routeProvider.when('/ui', {templateUrl: 'uiExamples/base.html', controller: 'baseCtrl'});
        $routeProvider.when('/ui/base', {templateUrl: 'uiExamples/base.html', controller: 'baseCtrl'});
        $routeProvider.when('/ui/md/first', {templateUrl: 'uiExamples/docs/first.html', controller: 'baseCtrl'});
    })
    .controller('baseCtrl', ['$scope', function ($scope) {
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
                    {title:'Doll 3',route:'/ui/md/seven',icon:'home'}
                ]}
            ]},
            {title:'Baboon Toll',route:'/ui/md/eight'}
        ];
    }]);
