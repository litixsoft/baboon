/*global angular*/
angular.module('enterprise', ['enterprise.services'])
/**
 * Enterprise config area
 */
    .config(function ($routeProvider) {
        $routeProvider.when('/enterprise', {templateUrl: '/enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/enterprise/new', {templateUrl: '/enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/enterprise/edit/:id', {templateUrl: '/enterprise/edit.html', controller: 'editCtrl'});
    })
    .constant('enterprise.modulePath', 'example/enterprise/')
/**
 * Enterprise controller
 */
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', function ($scope, enterpriseCrew) {

        $scope.headline = "erschrift";
        $scope.message = "Hallo Herr/Frau User(in), was soll ich nun machen?"
        $scope.type = "Error";
        $scope.visible = false;
        $scope.visible2 = false;

//        $scope.callbackObj = function(){
//            console.log("OK: -----> Ich bin die Rückmeldung der Directive bb-msgbox, der Rückmeldung der Factory msgBox");
//            $scope.visible = $scope.visible2 = false;
//        };

        $scope.callbackObj = {
//            cbOk : function(){
//                console.log("OK: -----> Ich bin die Rückmeldung der Directive bb-msgbox, der Rückmeldung der Factory msgBox");
//                $scope.visible = $scope.visible2 = false;
//            },
//            cbClose : function(){
//                console.log("CLOSE: -----> Ich bin die Rückmeldung der Directive bb-msgbox, der Rückmeldung der Factory msgBox");
//                $scope.visible = $scope.visible2 = false;
//            },
            cbYes : function(){
                console.log("YES: -----> Ich bin die Rückmeldung der Directive bb-msgbox, der Rückmeldung der Factory msgBox");
                $scope.visible = $scope.visible2 = false;
            },
            cbNo : function(){
                console.log("NO: -----> Ich bin die Rückmeldung der Directive bb-msgbox, der Rückmeldung der Factory msgBox");
                $scope.visible = $scope.visible2 = false;
            }
        };



        enterpriseCrew.getAll(function (data) {
            $scope.enterpriseCrew = data;
        });

        $scope.open = function () {
            $scope.shouldBeOpen = true;
        };

        $scope.close = function () {
            $scope.closeMsg = 'I was closed at: ' + new Date();
            $scope.shouldBeOpen = false;
        };

        $scope.items = ['item1', 'item2'];

        $scope.opts = {
            backdropFade: true,
            dialogFade: true
        };

        $scope.onFilesSelected = function(files) {
            $scope.files = files;
        };
    }])
/**
 * Enterprise edit controller
 */
    .controller('editCtrl', ['$scope', '$location', '$routeParams', 'enterpriseCrew', function ($scope, $location, $routeParams, enterpriseCrew) {

        enterpriseCrew.getById([$routeParams.id], function (data) {
            $scope.person = data;
        });

        $scope.save = function () {
            enterpriseCrew.updateById($routeParams.id, $scope.person, function() {
                $location.path('/enterprise');
            });
        };
    }])
/**
 * Enterprise new controller
 */
    .controller('newCtrl', ['$scope', '$location', 'enterpriseCrew', function ($scope, $location, enterpriseCrew) {
        $scope.person = {name: '', description: ''};
        $scope.save = function () {
            enterpriseCrew.create($scope.person, function() {
                $location.path('/enterprise');
            });
        };
    }]);