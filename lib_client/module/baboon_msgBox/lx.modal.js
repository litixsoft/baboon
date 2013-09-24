/*global angular*/
angular.module('lx.modal', ['lx.modal.directives'])//,'baboon.msgBox.tpl/msgBox.html'])
    .service('lxModal', ['$modal', function ($modal) {

        var pub = {},
            modalInstance;

        /**
         * Opens the modal window.
         *
         * @param {string} headline The headline to show.
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window OR {object=} object with multible callbacks
         * @param {string=} cssClass an optinal css class to manipulate the msgbox style
         */
        var show = function (headline, message, type, callObj, cssClass) {

            pub.headline = headline || '';
            pub.message = message;
            pub.type = type || 'info';
            pub.class = cssClass || '';

            if(typeof(callObj)=== 'function'){
                pub.actionOk = callObj;
            } else if(typeof(callObj)=== 'object'){
                pub.actionOk = callObj.cbOk;
                pub.actionClose = callObj.cbClose;
                pub.actionYes = callObj.cbYes;
                pub.actionNo = callObj.cbNo;
            } else {
                pub.actionClose = true;
            }

            modalInstance = $modal.open({
                backdrop: 'static',
                keyboard: false,
//                templateUrl: 'baboon.msgBox.tpl/msgBox.html'
                templateUrl: '/baboon_msgBox/msgBox.html'
            });
        };


        pub.msgBox = function(headline, message, type, callObj, cssClass){
            show(headline, message, type, callObj, cssClass);
        };

        pub.popUp = function(){

        };

        /**
         * Closes the modal window and clears the error message/action. is called by every action like: yes, no,ok,close
         */
        pub.reset = function () {
            pub.headline = '';
            pub.message = '';
            pub.type = '';
            pub.actionOk = null;
            pub.actionClose = null;
            pub.actionYes = null;
            pub.actionNo = null;

            if (modalInstance) {
                modalInstance.dismiss('cancel');
            }
        };

        /**
         * Executes the YES action and closes the modal window
         */
        pub.yes = function() {
            if (typeof pub.actionYes === 'function') {
                pub.actionYes.call();
            }
            pub.reset();
        };

        /**
         * Executes the NO action and closes the modal window
         */
        pub.no = function() {
            if (typeof pub.actionNo === 'function') {
                pub.actionNo.call();
            }
            pub.reset();
        };

        /**
         * Executes the OK action and closes the modal window
         */
        pub.ok = function () {
            if (typeof pub.actionOk === 'function') {
                pub.actionOk.call();
            }
            pub.reset();
        };

        /**
         * Executes the CLOSE action and closes the modal window
         */
        pub.close = function () {
            if (typeof pub.actionOk === 'function') {
                pub.actionClose.call();
            }
            pub.reset();
        };

        return pub;
    }]);