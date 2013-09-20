/*global angular*/
angular.module('baboon.msgBox', ['baboon.msgBox.directives','baboon.msgBox.tpl/msgBox.html'])
    .factory('msgBox', ['$modal', function ($modal) {
        var pub = {},
            modalInstance,
            modal = { };

        /**
         * Opens the modal window.
         *
         * @param {string} headline The headline to show.
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window OR {object=} object with multible callbacks
         * @param {string=} cssClass an optinal css class to manipulate the msgbox style
         */
        modal.show = function (headline, message, type, callObj, cssClass) { //callbackOk, callbackClose, callbackYes, callbackNo,
            modal.headline = headline || '';
            modal.message = message;
            modal.type = type || '';
            modal.class = cssClass || '';

            if(typeof(callObj)=== 'function'){
                modal.actionOk = callObj;
            } else if(typeof(callObj)=== 'object'){
                modal.actionOk = callObj.cbOk;
                modal.actionClose = callObj.cbClose;
                modal.actionYes = callObj.cbYes;
                modal.actionNo = callObj.cbNo;
            } else {
                modal.actionClose = true;
            }

            modalInstance = $modal.open({
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'baboon.msgBox.tpl/msgBox.html'
            });
        };

        /**
         * Closes the modal window and clears the error message/action. is called by every action like: yes, no,ok,close
         */
        modal.reset = function () {
            modal.headline = '';
            modal.message = '';
            modal.type = '';
            modal.actionOk = null;
            modal.actionClose = null;
            modal.actionYes = null;
            modal.actionNo = null;

            if (modalInstance) {
                modalInstance.dismiss('cancel');
            }
        };

        /**
         * Executes the YES action and closes the modal window
         */
        modal.yes = function() {
            if (typeof modal.actionYes === 'function') {
                modal.actionYes.call();
            }
            modal.reset();
        };
        /**
         * Executes the NO action and closes the modal window
         */
        modal.no = function() {
            if (typeof modal.actionNo === 'function') {
                modal.actionNo.call();
            }
            modal.reset();
        };

        /**
         * Executes the OK action and closes the modal window
         */
        modal.ok = function () {
            if (typeof modal.actionOk === 'function') {
                modal.actionOk.call();
            }
            modal.reset();
        };
        /**
         * Executes the CLOSE action and closes the modal window
         */
        modal.close = function () {
            if (typeof modal.actionOk === 'function') {
                modal.actionClose.call();
            }
            modal.reset();
        };

        // api
        pub.modal = modal;

        return pub;
    }]);