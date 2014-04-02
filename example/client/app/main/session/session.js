'use strict';

angular.module('main.session', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/session', {
                templateUrl: 'app/main/session/session.html',
                controller: 'MainSessionCtrl',
                app: 'main'
            });
    })
    .controller('MainSessionCtrl', function ($scope, $bbcSession) {

        $scope.activityMessages = [];

        $scope.clearActivity = function () {
            $scope.activityMessages = [];
        };

        $scope.getLastActivity = function () {
            $scope.activityMessages.push({class: 'sent', message: 'SENT: ' + 'getLastActivity'});

            $bbcSession.getLastActivity(function (error, data) {

                if (error) {
                    $scope.activityMessages.push({class: 'error', message: error});
                }
                else {
                    var now = new Date(data.activity);
                    $scope.activityMessages.push({class: 'response', message: 'RESPONSE: ' + 'last activity is ' + now});
                }
            });
        };

        $scope.setActivity = function (now) {

            now = now || new Date();
            $scope.activityMessages.push({class: 'sent', message: 'SENT: ' + 'set activity to ' + now});

            $bbcSession.setActivity(function (error) {
                if (error) {
                    $scope.activityMessages.push({class: 'error', message: error});
                }
                else {
                    $scope.activityMessages.push({class: 'response', message: 'RESPONSE: true'});
                }
            });
        };

        $scope.dataMessages = [];

        $scope.clearData = function () {
            $scope.dataMessages = [];
        };

        $scope.getData = function () {

            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'get all session data'});

                $bbcSession.getData(function (error, result) {
                    if (error) {
                        $scope.dataMessages.push({class: 'error', message: error});
                    }
                    else {
                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: '});
                        $scope.dataMessages.push({class: 'response', message: result});
                    }
                });
            }
            else {

                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'get key: ' + $scope.data.key});

                $bbcSession.getData($scope.data.key, function (error, result) {
                    if (error) {
                        $scope.dataMessages.push({class: 'error', message: error});
                    }
                    else {
                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: ' });
                        $scope.dataMessages.push({class: 'response', message: result});
                    }
                });
            }
        };

        $scope.setData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0 || typeof $scope.data.value === 'undefined' ||
                $scope.data.value.length === 0) {

                $scope.dataMessages.push({class: 'error', message: 'ERROR: ' + 'for save in session is key and value required'});
            }
            else {

                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'setData ' + 'key:' + $scope.data.key + ' value:' + $scope.data.value});

                $bbcSession.setData($scope.data.key, $scope.data.value, function (error, result) {
                    if (error) {
                        $scope.dataMessages.push({class: 'error', message: error});
                    }
                    else {
                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: ' + result});
                    }
                });
            }
        };

        $scope.deleteData = function () {
            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
                $scope.data.key.length === 0) {

                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'set no key, delete all objects in session.data'});

                $bbcSession.deleteData(function (error, result) {
                    if (error) {
                        $scope.dataMessages.push({class: 'error', message: error});
                    }
                    else {
                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: ' + result});
                    }
                });
            }
            else {

                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'delete ' + $scope.data.key + ' in session.data'});

                $bbcSession.deleteData($scope.data.key, function (error, result) {
                    if (error) {
                        $scope.dataMessages.push({class: 'error', message: error});
                    }
                    else {
                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: ' + result});
                    }
                });
            }
        };
    });