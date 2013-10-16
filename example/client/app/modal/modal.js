/*global angular*/
angular.module('modalExample', []).
    config(function ($routeProvider) {
        $routeProvider.when('/modal', {templateUrl: 'modal/modal.html', controller: 'modalExampleCtrl'});
    })
    .controller('modalExampleCtrl', ['$scope','lxModal', function ($scope, lxModal) {

        $scope.message = '';

        $scope.popupYesNo = function(){
            lxModal.msgBox('modalExamplePopup', false,'Ja bzw. Nein drücken!', 'Wenn Sie "ja" drücken wollen tun sie dies bitte, ansonsten einfach "nein" drücken.', 'Warning', {
                cbYes: function () {
                    $scope.message = "Du hast tatsächlich ja gedrückt.";
                },
                cbNo: function () {
                    $scope.message = "Du willst es also wirklich nicht.";
                }
            });//,'standard');
        };

        $scope.popupOkClose = function(){
            lxModal.msgBox('modalExamplePopup', false,'Ok bzw. Close drücken!', 'Wenn Sie "Ok" drücken wollen tun sie dies bitte, ansonsten einfach "Close" drücken.', 'Warning', {
                cbOk: function () {
                    $scope.message = "Wow, du findest es also auch ok.";
                },
                cbClose: function () {
                    $scope.message = "Dann schließe ich es halt..";
                }
            });//,'standard');
        };

        $scope.popupModal = function(){
            lxModal.msgBox('modalExamplePopup', true,'Modales Popup', 'So ich bin einfach mal ein Modales Popup, cool oder?', 'Warning', {
                cbOk: function () {
                    $scope.message = "Ich schließe das Popup mal für dich.";
                }
            });//,'standard');
        };

        $scope.popupModalUpdate = function(){
            lxModal.msgBox('modalExamplePopup', true,'Modales Popup', 'So ich bin einfach mal ein Modales Popup, cool oder?', 'Warning', {
                cbOk: function () {
                    $scope.message = "Ich schließe das Popup mal für dich.";
                }
            });//,'standard');

            setTimeout(function(){
                lxModal.updateMsg('modalExamplePopup','Diese zweite, neue Meldung wird dir von Litixsoft präsentiert!');
            },3000);
        };


    }]);

