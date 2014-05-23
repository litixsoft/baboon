'use strict';

describe('App: account', function () {

    beforeEach(module('account'));
    beforeEach(module('bbc.transport'));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes['/account/login'].controller).toBe('AccountLoginCtrl');
            expect($route.routes['/account/login'].templateUrl).toEqual('app/account/login.html');
            // otherwise redirect to
            expect($route.routes[null].redirectTo).toEqual('/account/login');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

    it('should call $translate switch the locale', function () {
        inject(function ($rootScope) {

            $rootScope.switchLocale('de-de');
            expect($rootScope.currentLang).toBe('de-de');
        });
    });

    it('should raise the $translateChangeSuccess event', function () {
        var setTmp;

        inject(function ($rootScope, $translate, tmhDynamicLocale) {
            $translate.use = function () {
                return 'test';
            };

            tmhDynamicLocale.set = function (translate) {
                setTmp = translate;
            };

            $rootScope.$emit('$translateChangeSuccess');
            expect(setTmp).toBe('test');
        });
    });

    it('should raise the $sessionInactive event', function () {
        inject(function ($rootScope, $log) {
            spyOn($log, 'warn');
            expect($rootScope.requestNeeded).toBe(false);
            $rootScope.$emit('$sessionInactive');
            expect($rootScope.requestNeeded).toBe(true);
            expect($log.warn).toHaveBeenCalledWith('next route change event triggers a server request.');
        });
    });

    describe('App account - $routeChangeStart event ', function () {
        var $window, $rootScope, $log, $bbcSession, $location;

        beforeEach(module('bbc.session'));

        beforeEach(function () {
            $window = {location: { assign: jasmine.createSpy()} };
            $location = {url: jasmine.createSpy()};

            module(function ($provide) {
                $provide.value('$window', $window);
            });

            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $rootScope.requestNeeded = true;
                $log = $injector.get('$log');
                $bbcSession = $injector.get('$bbcSession');
                $bbcSession.setActivity = function (callback) {
                    callback(null);
                };
                $location = $injector.get('$location');
            });
        });

        it('should raise the $routeChangeStart event', function () {
            $rootScope.$emit('$routeChangeStart', {$$route: {originalPath: '/test'}});
            expect($window.location.assign).toHaveBeenCalledWith('/test');
        });

        it('should raise the $routeChangeStart event with $rootScope.requestNeeded is false', function () {
            $rootScope.requestNeeded = false;
            $rootScope.$emit('$routeChangeStart', {$$route: {originalPath: '/test'}});
        });

        it('should be error when session activity check returned error', function () {
            spyOn($log, 'warn');

            $bbcSession.setActivity = function (callback) {
                callback('test error');
            };

            $rootScope.$emit('$routeChangeStart', {$$route: {originalPath: '/test'}});
            expect($log.warn).toHaveBeenCalledWith('test error');
        });
    });

    describe('AccountLoginCtrl', function () {
        beforeEach(module('bbc.form'));

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

    describe('AccountUsernameCtrl', function () {
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
            $ctrl = $controller('AccountUsernameCtrl', { $scope: $scope });
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
                $scope.user = { email: 'test@test.com' };
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
                $scope.user = { email: 'bad' };
                $scope.send();

                expect($scope.form.errors).toBeDefined();
                expect($scope.form.errors.email).toBeDefined();
            });
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
