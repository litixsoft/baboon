/*global angular*/
angular.module('lx.alert', [])
    // Service for angular-ui alert handling
    .factory('lxAlert', ['$log', '$timeout', function ($log, $timeout) {
        var alert = {};

        // timeout for show alert box
        alert.timeout = 5000;

        // logLevel for $log
        alert.logLevel = 'info';

        // show or hide alert message box
        alert.visible = false;

        // private for timeout cancel
        var promise = null;

        // private close helper
        var close = function() {
            alert.visible = false;
        };

        // private log helper
        var log = function(type, msg) {

            var level = 0;

            if (alert.logLevel === 'info') {
                level = 4;
            }
            if (alert.logLevel === 'success') {
                level = 3;
            }
            if (alert.logLevel === 'warning') {
                level = 2;
            }
            if (alert.logLevel === 'error') {
                level = 1;
            }

            if (type === 'info' && level >= 4) {
                $log.info(type + ': ' + msg);
            }
            if (type === 'success' && level >= 3) {
                $log.info(type + ': ' + msg);
            }
            if (type === 'warning' && level >= 2) {
                $log.warn(type + ': ' + msg);
            }
            if (type === 'error' && level >= 1 ) {
                $log.error(type + ': ' + msg);
            }
        };

        // private show helper
        var show = function(type, msg) {
            alert.type = type;
            alert.msg = msg;
            alert.visible = true;

            // log in console
            log(type, msg);

            // timeout for close alert
            if (alert.timeout > 0) {
                if(promise) {
                    $timeout.cancel(promise);
                }
                promise = $timeout(function() {
                    close();
                }, alert.timeout);
            }
        };

        // close alert message
        alert.close = function() {
            close();
        };

        // show info alert message
        alert.info = function (message) {
            show('info', message);
        };

        // show success alert message
        alert.success = function (message) {
            show('success', message);
        };

        // show warning alert message
        alert.warning = function (message) {
            show('warning', message);
        };

        // show error alert message
        alert.error = function (message) {
            show('error', message);
        };

        return alert;
    }]);
