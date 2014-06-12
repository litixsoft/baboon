'use strict';

describe('Module: account.password', function () {

    beforeEach(module('account'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('account.password'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes['/account/password'].controller).toBe('AccountPasswordCtrl');
            expect($route.routes['/account/password'].templateUrl).toEqual('app/account/password/password.html');
        });
    });

    describe('AccountPasswordCtrl', function () {
        beforeEach(module('bbc.form'));

        var $ctrl, $scope, $transport;

        beforeEach(inject(function ($controller, $rootScope, $injector) {
            $transport = $injector.get('$bbcTransport');
            $transport.emit = function (event, user, callback) {
                if(!user.email) {
                    callback({valid: false});
                }
                else if(user.email === 'bad') {
                    callback({name: 'ValidationError', errors: [{ actual: 'bad', attribute: 'format', expected: 'email', message: 'is not a valid email', property: 'email' }]});
                }
                else {
                    callback(null, user);
                }
            };
            $scope = $rootScope.$new();
            $ctrl = $controller('AccountPasswordCtrl', { $scope: $scope });
        }));

        it('should be initialized correctly', function () {
            expect(typeof $scope.closeAlert).toBe('function');
            expect(typeof $scope.send).toBe('function');
            expect(typeof $scope.alerts).toBe('object');
        });

        describe('has a function closeAlert() which', function () {
            it('should close an alert', function () {
                $scope.alerts = [{type: 'danger', msg: 'error'}];
                $scope.closeAlert(0);
                expect($scope.alerts.length).toBe(0);
            });
        });

        describe('has a function send which', function () {
            it('should do nothing if form is invalid', function() {
                $scope.form =  { $valid: false };
                $scope.alerts = [{type: 'danger', msg: 'error'}];
                $scope.send();
                expect($scope.alerts.length).toBe(1);
            });

            it('should get a valid username', function() {
                $scope.form =  { $valid: true, $setPristine: function() {} };
                $scope.alerts = [];
                $scope.user = { name: 'Tina', email: 'test@test.com' };
                $scope.send();

                expect($scope.alerts.length).toBe(1);
                expect($scope.alerts[0].type).toBe('success');
            });

            it('should return an error', function() {
                $scope.alerts = [];
                $scope.user = {};
                $scope.send();

                expect($scope.alerts.length).toBe(1);
                expect($scope.alerts[0].type).toBe('danger');
            });

            it('should return validation errors', function() {
                $scope.form =  { $valid: true };
                $scope.alerts = [];
                $scope.user = { name: 'Tina', email: 'bad' };
                $scope.send();

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.email).toBeDefined();
            });
        });
    });
});