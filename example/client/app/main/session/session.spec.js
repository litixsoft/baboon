
'use strict';

describe('Module: main.session', function () {

    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.session'));
    beforeEach(module('main.session'));

    it('should map routes', function () {

        inject(function ($route) {
            expect($route.routes['/session'].controller).toBe('MainSessionCtrl');
            expect($route.routes['/session'].templateUrl).toEqual('app/main/session/session.html');
        });
    });

    describe('Controller: MainSessionCtrl', function () {

        var $session, $scope, $ctrl;

        beforeEach(function (done) {
            inject(function ($controller, $rootScope, $injector) {

                $session = $injector.get('$bbcSession');
                $scope = $rootScope.$new();
                $ctrl = $controller('MainSessionCtrl', {$scope: $scope});

                done();
            });
        });

        it('should attach vars to the scope', function () {
            expect($scope.activityMessages).toBeDefined();
            expect($scope.clearActivity).toBeDefined();
            expect($scope.getLastActivity).toBeDefined();
            expect($scope.setActivity).toBeDefined();
            expect($scope.dataMessages).toBeDefined();
            expect($scope.clearData).toBeDefined();
            expect($scope.getData).toBeDefined();
            expect($scope.setData).toBeDefined();
            expect($scope.deleteData).toBeDefined();
        });

        it('should be clear activity messages', function () {
            $scope.activityMessages.push('test');
            expect($scope.activityMessages[0]).toBe('test');
            $scope.clearActivity();
            expect($scope.activityMessages.length).toBe(0);
        });

        it('should be return correct last activity', function () {

            var checkDate = new Date();

            $session.getLastActivity = function (callback) {
                callback(null, {activity: checkDate.toISOString()});
            };

            $scope.getLastActivity();

            expect($scope.activityMessages[0].message).toBe('SENT: getLastActivity');
            expect($scope.activityMessages[1].message).toBe('RESPONSE: last activity is ' + checkDate);
        });

        it('should be return error by last activity', function () {

            $session.getLastActivity = function (callback) {
                callback('test error');
            };

            $scope.getLastActivity();

            expect($scope.activityMessages[0].message).toBe('SENT: getLastActivity');
            expect($scope.activityMessages[1].message).toBe('test error');
        });

        it('should be set correct activity', function () {

            var checkDate = new Date();

            $session.setActivity = function (callback) {
                callback(null, true);
            };

            $scope.setActivity(checkDate);

            expect($scope.activityMessages[0].message).toBe('SENT: set activity to ' + checkDate);
            expect($scope.activityMessages[1].message).toBe('RESPONSE: true');
        });

        it('should be set correct activity without parameter now', function () {

            $session.setActivity = function (callback) {
                callback(null, true);
            };

            $scope.setActivity();

            expect($scope.activityMessages[1].message).toBe('RESPONSE: true');
        });

        it('should be return error by set activity', function () {

            $session.setActivity = function (callback) {
                callback('test error');
            };

            $scope.setActivity();

            expect($scope.activityMessages[1].message).toBe('test error');
        });

        it('should be clear data messages', function () {

            $scope.dataMessages.push('test');

            expect($scope.dataMessages[0]).toBe('test');

            $scope.clearData();

            expect($scope.dataMessages.length).toBe(0);
        });

        it('should be getData return correct result with $scope.data is undefined', function () {

            $session.getData = function (callback) {
                callback(null, {testKey:'testValue'});
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get all session data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: ');
            expect($scope.dataMessages[2].message).toEqual({testKey:'testValue'});
        });

        it('should be getData return correct result with $scope.data.key is undefined', function () {

            $scope.data = {};

            $session.getData = function (callback) {
                callback(null, {testKey:'testValue'});
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get all session data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: ');
            expect($scope.dataMessages[2].message).toEqual({testKey:'testValue'});
        });

        it('should be getData return correct result with $scope.data.key is empty', function () {

            $scope.data = {};
            $scope.data.key = '';

            $session.getData = function (callback) {
                callback(null, {testKey:'testValue'});
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get all session data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: ');
            expect($scope.dataMessages[2].message).toEqual({testKey:'testValue'});
        });

        it('should be getData return error with $scope.data is undefined', function () {

            $session.getData = function (callback) {
                callback('test error');
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get all session data');
            expect($scope.dataMessages[1].message).toBe('test error');
        });

        it('should be getData return correct result with $scope.data.key is test', function () {

            $scope.data = {
                key: 'testKey'
            };

            $session.getData = function (key, callback) {
                callback(null, key);
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get key: ' + $scope.data.key);
            expect($scope.dataMessages[1].message).toBe('RESPONSE: ');
            expect($scope.dataMessages[2].message).toBe($scope.data.key);
        });

        it('should be getData return error with $scope.data.key is test', function () {

            $scope.data = {
                key: 'testKey'
            };

            $session.getData = function (key, callback) {
                callback('test error');
            };

            $scope.getData();

            expect($scope.dataMessages[0].message).toBe('SENT: get key: ' + $scope.data.key);
            expect($scope.dataMessages[1].message).toBe('test error');
        });

        it('should be setData return error when $scope.data is undefined', function () {
            $scope.setData();
            expect($scope.dataMessages[0].message).toBe('ERROR: for save in session is key and value required');
        });

        it('should be setData return error when $scope.data.key is undefined', function () {
            $scope.data = {};
            $scope.setData();
            expect($scope.dataMessages[0].message).toBe('ERROR: for save in session is key and value required');
        });

        it('should be setData return error when $scope.data.key is empty', function () {
            $scope.data = {
                key: ''
            };
            $scope.setData();
            expect($scope.dataMessages[0].message).toBe('ERROR: for save in session is key and value required');
        });

        it('should be setData return error when $scope.data.value is undefined', function () {
            $scope.data = {
                key: 'testKey'
            };
            $scope.setData();
            expect($scope.dataMessages[0].message).toBe('ERROR: for save in session is key and value required');
        });

        it('should be setData return error when $scope.data.value is empty', function () {
            $scope.data = {
                key: 'testKey',
                value: ''
            };
            $scope.setData();
            expect($scope.dataMessages[0].message).toBe('ERROR: for save in session is key and value required');
        });

        it('should be setData save correct key/value', function () {
            $scope.data = {
                key: 'testKey',
                value: 'testValue'
            };

            $session.setData = function (key, value, callback) {
                callback(null, 'key:' + key + ' value:' + value);
            };

            $scope.setData();

            expect($scope.dataMessages[0].message).toBe('SENT: setData key:' + $scope.data.key + ' value:' + $scope.data.value);
            expect($scope.dataMessages[1].message).toBe('RESPONSE: key:testKey value:testValue');
        });

        it('should be return error by setData', function () {
            $scope.data = {
                key: 'testKey',
                value: 'testValue'
            };

            $session.setData = function (key, value, callback) {
                callback('test error');
            };

            $scope.setData();

            expect($scope.dataMessages[0].message).toBe('SENT: setData key:' + $scope.data.key + ' value:' + $scope.data.value);
            expect($scope.dataMessages[1].message).toBe('test error');
        });

        it('should be delete complete data container when $scope.data is undefined', function () {

            $session.deleteData = function (callback) {
                callback(null, 'test');
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: set no key, delete all objects in session.data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: test');
        });

        it('should be delete complete data container when $scope.data.key is undefined', function () {

            $scope.data = {};

            $session.deleteData = function (callback) {
                callback(null, 'test');
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: set no key, delete all objects in session.data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: test');
        });

        it('should be delete complete data container when $scope.data.key is empty', function () {

            $scope.data = {
                key: ''
            };

            $session.deleteData = function (callback) {
                callback(null, 'test');
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: set no key, delete all objects in session.data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: test');
        });

        it('should be return error', function () {

            $session.deleteData = function (callback) {
                callback('error test');
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: set no key, delete all objects in session.data');
            expect($scope.dataMessages[1].message).toBe('error test');
        });

        it('should be delete data with key', function () {

            $scope.data = {
                key: 'testKey'
            };

            $session.deleteData = function (key, callback) {
                callback(null, 'key:' + key);
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: delete ' + $scope.data.key + ' in session.data');
            expect($scope.dataMessages[1].message).toBe('RESPONSE: key:testKey');
        });

        it('should be return error', function () {

            $scope.data = {
                key: 'testKey'
            };

            $session.deleteData = function (key, callback) {
                callback('error test');
            };

            $scope.deleteData();

            expect($scope.dataMessages[0].message).toBe('SENT: delete ' + $scope.data.key + ' in session.data');
            expect($scope.dataMessages[1].message).toBe('error test');
        });
    });
});
