/*global angular*/
angular.module('baboon.msgBox',  ['baboon.msgBox.tpl/msgBox.html'])
    .factory('msgBox',['$modal', function ($modal) {
        var pub = {},
            modalInstance,
            modal = {
                opts: {
                    backdropClick: false,
                    backdropFade: true,
                    dialogFade: true
                }
            };

        /**
         * Closes the modal window and clears the error message/action.
         */
        modal.close = function () {
//            modal.shouldBeOpen = false;
            modal.headline = '';
            modal.message = '';
            modal.type = '';
            modal.action = null;
            modalInstance.dismiss('cancel');
        };

        /**
         * Opens the modal window.
         *
         * @param {string} headline The headline to show.
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window.
         */
        modal.show = function (headline, message, type, callback) {
//            modal.shouldBeOpen = true;
            modal.headline = headline || '';
            modal.message = message;
            modal.type = type || 'Error';
            modal.action = callback;

            modalInstance = $modal.open({
                templateUrl: 'baboon.msgBox.tpl/msgBox.html'
            });
        };

        /**
         * Executes the action and closes the modal window
         */
        modal.ok = function () {
            if (typeof modal.action === 'function') {
                modal.action.call();
            }
            modal.close();
        };

        // api
        pub.modal = modal;

        return pub;
    }]);