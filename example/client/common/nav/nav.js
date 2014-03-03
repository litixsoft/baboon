'use strict';

angular.module('common.nav', [])
    .controller('CommonNavCtrl', function ($scope, $location, navigation) {

        navigation.getTopList(function (error, navList) {

            if (error || navList.length === 0) {
                $scope.menuTopList = [];
            }
            else {
                $scope.menuTopList = navList;
            }
        });

        navigation.getSubList($location.path(), function (error, navList) {

            if (error || navList.length === 0) {
                $scope.menuSubList = [];
            }
            else {
                $scope.menuSubList = navList;
            }
        });

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    })
    .provider('navigation', function () {

        var currentApp;

        /**
         * Set navigation with current app and root title
         *
         * @param current
         * @param root {string} title for route /
         */
        this.setCurrentApp = function (current) {
            currentApp = current;
        };

        this.$get = function ($http) {
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

                $http.post('/api/navigation/getTree', {current: currentApp})
                    .success(function (navigation) {
                        callback(null, navigation);
                    })
                    .error(function (data, status, headers, config) {
                        var error = {data: data, status: status, headers: headers, config: config};
                        callback(error);
                    });
            };

            /**
             * Get navigation flat list
             *
             * @param callback
             */
            pub.getList = function (callback) {

                $http.post('/api/navigation/getList', {current: currentApp})
                    .success(function (navigation) {
                        callback(null, navigation);
                    })
                    .error(function (data, status, headers, config) {
                        var error = {data: data, status: status, headers: headers, config: config};
                        callback(error);
                    });
            };

            /**
             * Get toplevel of navigation
             *
             * @param callback
             */
            pub.getTopList = function (callback) {

                $http.post('/api/navigation/getTopList', {current: currentApp})
                    .success(function (navigation) {
                        callback(null, navigation);
                    })
                    .error(function (data, status, headers, config) {
                        var error = {data: data, status: status, headers: headers, config: config};
                        callback(error);
                    });
            };

            /**
             * Get all sub links from a top as tree
             *
             * @param top
             * @param callback
             */
            pub.getSubTree = function (top, callback) {

                $http.post('/api/navigation/getSubTree', {current: currentApp, top: top})
                    .success(function (navigation) {
                        callback(null, navigation);
                    })
                    .error(function (data, status, headers, config) {
                        var error = {data: data, status: status, headers: headers, config: config};
                        callback(error);
                    });
            };

            /**
             * Get all sub links from a top as flat list
             *
             * @param top
             * @param callback
             */
            pub.getSubList = function (top, callback) {

                $http.post('/api/navigation/getSubList', {current: currentApp, top: top})
                    .success(function (navigation) {
                        callback(null, navigation);
                    })
                    .error(function (data, status, headers, config) {
                        var error = {data: data, status: status, headers: headers, config: config};
                        callback(error);
                    });
            };

            return pub;
        };
    });