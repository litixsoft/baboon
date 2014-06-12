'use strict';

describe('Module: account.register', function () {

    beforeEach(module('account'));
    beforeEach(module('ngRoute'));
    beforeEach(module('bbc.transport'));
    beforeEach(module('account.register'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes['/account/register'].controller).toBe('AccountRegisterCtrl');
            expect($route.routes['/account/register'].templateUrl).toEqual('app/account/register/register.html');
        });
    });

    describe('AccountRegisterCtrl', function () {
        beforeEach(module('bbc.form'));

        var $ctrl, $scope, $transport;

        beforeEach(inject(function ($controller, $rootScope, $injector, $translate) {
            $transport = $injector.get('$bbcTransport');

            $translate.use = function () {
                return 'de-de';
            };

            $transport.emit = function (event, user, callback) {
                if(!user.name && !user.display_name && !user.email) {
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
            $ctrl = $controller('AccountRegisterCtrl', { $scope: $scope });
        }));

        it('should be initialized correctly', function () {
            expect(typeof $scope.closeAlert).toBe('function');
            expect(typeof $scope.register).toBe('function');
            expect(typeof $scope.alerts).toBe('object');
        });

        describe('has a function closeAlert() which', function () {
            it('should close an alert', function () {
                $scope.alerts = [{type: 'danger', msg: 'error'}];
                $scope.closeAlert(0);
                expect($scope.alerts.length).toBe(0);
            });
        });

        describe('has a function register which', function() {
            it('should do nothing if form is invalid', function() {
                $scope.form =  { $valid: false };
                $scope.alerts = [{type: 'danger', msg: 'error'}];
                $scope.register();
                expect($scope.alerts.length).toBe(1);
            });

            it('should register a valid user', function() {
                $scope.form =  { $valid: true, $setPristine: function() {} };
                $scope.alerts = [];
                $scope.user = { name: 'Test', display_name: 'Tina Test', email: 'test@test.com' };
                $scope.register();

                expect($scope.alerts.length).toBe(1);
                expect($scope.alerts[0].type).toBe('success');
            });

            it('should return an error', function() {
                $scope.alerts = [];
                $scope.user = {};
                $scope.register();

                expect($scope.alerts.length).toBe(1);
                expect($scope.alerts[0].type).toBe('danger');
            });

            it('should return validation errors', function() {
                $scope.form =  { $valid: true };
                $scope.alerts = [];
                $scope.user = { name: 'Test', display_name: 'Tina Test', email: 'bad' };
                $scope.register();

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.email).toBeDefined();
            });
        });
    });
});