
'use strict';

angular.module('common.nav', [])
    .controller('CommonNavCtrl', function ($scope, $location, navigation) {

        navigation.getList(function(error, navList) {
            $scope.menu = navList;
        });

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    })
    .provider('navigation', function () {

        var currentApp;
        var navList;
        var navTree;
        var navTop;
        var navSubList;
        var navSubTree;

        this.setCurrentApp = function(current) {
            currentApp = current;
        };

        this.$get = function($http) {
            var pub = {};

            /**
             * Get the current app
             *
             * @returns {*}
             */
            pub.getCurrentApp = function () {
                return currentApp;
            };

            /**
             * Get navigation tree
             *
             * @param callback
             */
            pub.getTree = function (callback) {

                if (!navTree) {
                    $http.post('/api/navigation/getTree', {current: currentApp})
                        .success(function (navigation) {
                            navTree = navigation;
                            callback(null, navigation);
                        })
                        .error(function (data, status, headers, config) {
                            var error = {data: data, status: status, headers: headers, config: config};
                            callback(error);
                        });
                }
                else {
                    callback(null, navTree);
                }
            };

            /**
             * Get navigation flat list
             *
             * @param callback
             */
            pub.getList = function (callback) {

                if (!navList) {
                    $http.post('/api/navigation/getList', {current: currentApp})
                        .success(function (navigation) {
                            navList = navigation;
                            callback(null, navigation);
                        })
                        .error(function (data, status, headers, config) {
                            var error = {data: data, status: status, headers: headers, config: config};
                            callback(error);
                        });
                }
                else {
                    callback(null, navList);
                }
            };

            /**
             * Get toplevel of navigation
             *
             * @param callback
             */
            pub.getTopList = function (callback) {

                if (!navTop) {
                    $http.post('/api/navigation/getTopList', {current: currentApp})
                        .success(function (navigation) {
                            navTop = navigation;
                            callback(null, navigation);
                        })
                        .error(function (data, status, headers, config) {
                            var error = {data: data, status: status, headers: headers, config: config};
                            callback(error);
                        });
                }
                else {
                    callback(null, navTop);
                }
            };

            /**
             * Get all sub links from a top as tree
             *
             * @param top
             * @param callback
             */
            pub.getSubTree = function (top, callback) {

                if (!navSubTree) {
                    $http.post('/api/navigation/getSubTree', {current: currentApp, top:top})
                        .success(function (navigation) {
                            navSubTree = navigation;
                            callback(null, navigation);
                        })
                        .error(function (data, status, headers, config) {
                            var error = {data: data, status: status, headers: headers, config: config};
                            callback(error);
                        });
                }
                else {
                    callback(null, navSubTree);
                }
            };

            /**
             * Get all sub links from a top as flat list
             *
             * @param top
             * @param callback
             */
            pub.getSubList = function (top, callback) {

                if (!navSubList) {
                    $http.post('/api/navigation/getSubList', {current: currentApp, top:top})
                        .success(function (navigation) {
                            navSubList = navigation;
                            callback(null, navigation);
                        })
                        .error(function (data, status, headers, config) {
                            var error = {data: data, status: status, headers: headers, config: config};
                            callback(error);
                        });
                }
                else {
                    callback(null, navSubList);
                }
            };

            return pub;
        };
    });