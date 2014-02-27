/*
'use strict';

angular.module('bbc.alert', [])
    // Service for angular-ui alert handling
    .factory('bbcAlert', ['$log', '$timeout', function ($log, $timeout) {
        var pub = {};

        // timeout for show alert box.
        pub.timeout = 5000;

        // logLevel for $log
        pub.logLevel = 'info';

        // show or hide alert message box
        pub.visible = false;

        // private for timeout cancel
        var promise = null;

        // private close helper
        var close = function () {
            pub.visible = false;
        };

        // private log helper
        var log = function (type, msg) {

            var level = 0;

            if (pub.logLevel === 'info') {
                level = 4;
            }
            if (pub.logLevel === 'success') {
                level = 3;
            }
            if (pub.logLevel === 'warning') {
                level = 2;
            }
            if (pub.logLevel === 'error') {
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
            if (type === 'error' && level >= 1) {
                $log.error(type + ': ' + msg);
            }
        };

        // private show helper
        var show = function (type, msg) {
            pub.type = type;
            pub.msg = msg;
            pub.visible = true;

            // log in console
            log(type, msg);

            // timeout for close alert
            if (pub.timeout > 0) {
                if (promise) {
                    $timeout.cancel(promise);
                }
                promise = $timeout(function () {
                    close();
                }, pub.timeout);
            }
        };

        // close alert message
        pub.close = function () {
            close();
        };

        // show info alert message
        pub.info = function (message) {
            show('info', message);
        };

        // show success alert message
        pub.success = function (message) {
            show('success', message);
        };

        // show warning alert message
        pub.warning = function (message) {
            show('warning', message);
        };

        // show error alert message
        pub.error = function (message) {
            show('error', message);
        };

        return pub;
    }]);*/
