/*global angular*/
angular.module('modalExample', []).
    config(function ($routeProvider) {
        $routeProvider.when('/modal', {templateUrl: 'modal/modal.html', controller: 'modalExampleCtrl'});
    })
    .controller('modalExampleCtrl', ['$scope','lxModal', function ($scope, lxModal) {

        $scope.message = '';

        $scope.popupYesNo = function(){
            lxModal.msgBox('popupYesNo', false,'Ja bzw. Nein drücken!', 'Wenn Sie "ja" drücken wollen tun sie dies bitte, ansonsten einfach "nein" drücken.', 'Warning', {
                cbClose: function () {
                    $scope.message = "Du hast tatsächlich ja gedrückt.";
                }
//                ,
//                cbNo: function () {
//                    $scope.message = "Du willst es also wirklich nicht.";
//                }
            });//,'standard');
        };

        $scope.updatePopupMsg = function(){
            setTimeout(function(){
                lxModal.updateMsg('popupYesNo','Diese neue Meldung wird dir von Litixsoft präsentiert.!');
            },30);
        }

    }]);

