'use strict';

describe('Module: account.login', function () {

    beforeEach(module('account'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('account.login'));
    beforeEach(module('bbc.form'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes['/account/login'].controller).toBe('AccountLoginCtrl');
            expect($route.routes['/account/login'].templateUrl).toEqual('app/account/login/login.html');
            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/account/login');
        });
    });

    describe('AccountLoginCtrl', function () {
        var $ctrl, $scope, $transport, $window;

        beforeEach(inject(function ($controller, $rootScope, $injector) {
            $transport = $injector.get('$bbcTransport');
            $window = { location: { } };
            $scope = $rootScope.$new();
            $ctrl = $controller('AccountLoginCtrl', { $scope: $scope, $window: $window });
        }));

        it('should be initialized correctly', function () {
            expect(typeof $scope.login).toBe('function');
            expect(typeof $scope.user).toBe('object');
            expect(typeof $scope.$bbcForm).toBe('object');
            expect($scope.authFailed).toBeFalsy();
            expect($scope.authError).toBeFalsy();
            expect($scope.guestError).toBeFalsy();
        });

        describe('has a function login() which', function () {
            var type = 0;

            beforeEach(function () {
                $transport.rest = function (event, options, callback) {
                    if (event === 'api/auth/login' && type === 403) {
                        callback({status: 403, message: 'Access Denied'});
                    }
                    else if (event === 'api/auth/login' && type === 400) {
                        callback({status: 400, message: 'Guest Error'});
                    }
                    else if (event === 'api/auth/login' && type === 500) {
                        callback({status: 500, message: 'Internal Error'});
                    }
                    else {
                        callback(null, { state: true });
                    }
                };
            });

            it('should return an authFailed error', function () {
                $scope.form = {};

                type = 403;
                $scope.login();
                expect($scope.authFailed).toBeTruthy();
            });

            it('should return an guestError error', function () {
                type = 400;
                $scope.login();
                expect($scope.guestError).toBeTruthy();
            });

            it('should return an authError error', function () {
                type = 500;
                $scope.login();
                expect($scope.authError).toBeTruthy();
            });

            it('should redirect', function () {
                type = 0;
                $scope.login();
                expect($window.location.href).toBe('/');
            });
        });
    });
});