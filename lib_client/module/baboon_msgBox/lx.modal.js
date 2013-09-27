/*global angular*/

angular.module('lx.modal', ['lx.modal.directives'])
    .controller('lxModalCtrl',['$rootScope', '$scope', '$modalInstance','modalOptions', function($rootScope, $scope, $modalInstance, modalOptions){

        $scope.modalOptions = modalOptions;

        $rootScope.$on($scope.modalOptions.msgId,function(ev, mass){
            $scope.$apply(function () {
                $scope.modalOptions.message = mass;
            });
        });

        if(typeof($scope.modalOptions.callObj)=== 'function'){
            $scope.modalOptions.actionOk = $scope.modalOptions.callObj;
        } else if(typeof($scope.modalOptions.callObj)=== 'object'){
            $scope.modalOptions.actionOk = $scope.modalOptions.callObj.cbOk;
            $scope.modalOptions.actionClose = $scope.modalOptions.callObj.cbClose;
            $scope.modalOptions.actionYes = $scope.modalOptions.callObj.cbYes;
            $scope.modalOptions.actionNo = $scope.modalOptions.callObj.cbNo;
        } else {
            $scope.modalOptions.actionClose = true;
        }

        $scope.reset = function () {
            if ($modalInstance) {
                $modalInstance.dismiss('cancel');
            }
        };

        /** Executes the YES action and closes the modal window */
        $scope.modalOptions.yes = function() {
            if (typeof $scope.modalOptions.actionYes === 'function') {
                $scope.modalOptions.actionYes.call();
            }
            $scope.reset();
        };

        /** Executes the NO action and closes the modal window */
        $scope.modalOptions.no = function() {
            if (typeof $scope.modalOptions.actionNo === 'function') {
                $scope.modalOptions.actionNo.call();
            }
            $scope.reset();
        };

        /** Executes the OK action and closes the modal window */
        $scope.modalOptions.ok = function () {
            if (typeof $scope.modalOptions.actionOk === 'function') {
                $scope.modalOptions.actionOk.call();
            }
            $scope.reset();
        };

        /** Executes the CLOSE action and closes the modal window */
        $scope.modalOptions.close = function () {
            if (typeof $scope.modalOptions.actionOk === 'function') {
                $scope.modalOptions.actionClose.call();
            }
            $scope.reset();
        };
    }])
    .service('lxModal', ['$rootScope','$modal', function ($rootScope,$modal) {

        /**
         * Opens the modal window.
         *
         * @param {string} headline The headline to show.
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window OR {object=} object with multible callbacks
         * @param {string=} cssClass an optinal css class to manipulate the msgbox style
         */

        var pub = {};

        pub.updateMsg = function(id, message){
            $rootScope.$emit(id, message);
        };

        pub.msgBox = function(id, backdrop, headline, message, type, callObj, cssClass){

            var self = this;

            var modalOptions = {
                msgId: id,
                headline: headline,
                message: message,
                type: type,
                callObj: callObj,
                cssClass: cssClass
            };

            self.modalInstance = $modal.open({
                backdrop: backdrop, //static, true, false
                modalFade: true,
                controller: 'lxModalCtrl',
                resolve: {
                    modalOptions: function(){ return modalOptions; }
                },
                keyboard: false,
                templateUrl: '/baboon_msgBox/msgBox.html'
//                template: htmlTemplate
            });

        };

        pub.reset = function(){
            this.modalInstance.dismiss('cancel');
        };

        return pub;

    }]);
