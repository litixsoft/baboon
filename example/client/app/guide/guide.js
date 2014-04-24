'use strict';

angular.module('guide', [
        'ngRoute',
        'ui.bootstrap',
        'bbc.transport',
        'bbc.navigation',
        'bbc.session',
        'bbc.alert',
        'bbc.markdown',
        'hljs',
        'pascalprecht.translate',
        'tmh.dynamicLocale'
    ])
    .config(function ($routeProvider, $locationProvider, $bbcNavigationProvider, $translateProvider, $bbcTransportProvider, tmhDynamicLocaleProvider) {

        // Routing and navigation
        $routeProvider
            .when('/guide', { templateUrl: 'app/guide/guide.html', controller: 'GuideCtrl' })
            .when('/guide/alert', { templateUrl: 'app/guide/alert/alert.html', controller: 'AlertCtrl' })
//            .when('/guide/cache', { templateUrl: 'app/guide/cache/cache.html', controller: 'CacheCtrl' })
//            .when('/guide/float', { templateUrl: 'app/guide/float/float.html', controller: 'FloatCtrl' })
//            .when('/guide/integer', { templateUrl: 'app/guide/integer/integer.html', controller: 'IntegerCtrl' })
//            .when('/guide/nav-home', { templateUrl: 'app/guide/navigation/nav_home.html', controller: 'NavHomeCtrl' })
//            .when('/guide/nav-home/nav-products', { templateUrl: 'app/guide/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/guide/nav-home/nav-customers', { templateUrl: 'app/guide/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/guide/nav-home/nav-statistics', { templateUrl: 'app/guide/navigation/nav_home.html', controller: 'NavHomeCtrl'})
//            .when('/guide/nav-admin', { templateUrl: 'app/guide/navigation/nav_admin.html', controller: 'NavAdminCtrl' })
//            .when('/guide/session', { templateUrl: 'app/guide/session/session.html', controller: 'SessionCtrl' })
//            .when('/guide/transport', { templateUrl: 'app/guide/transport/transport.html', controller: 'TransportCtrl' })
            .otherwise({
                redirectTo: '/guide'
            });

        $locationProvider.html5Mode(true);

        $bbcNavigationProvider.set({
            app: 'guide',
            route: '/guide'
        });

        // Transport
        $bbcTransportProvider.set();

        // Translate
        tmhDynamicLocaleProvider.localeLocationPattern('assets/bower_components/angular-i18n/angular-locale_{{locale}}.js');

        $translateProvider.useStaticFilesLoader({
            prefix: '/locale/guide/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en-us');
        $translateProvider.fallbackLanguage('en-us');
    })
    .run(function ($rootScope, $translate, tmhDynamicLocale, $log, $window, $bbcSession) {

        $rootScope.currentLang = $translate.preferredLanguage();

        $rootScope.switchLocale = function(locale) {
            $translate.use(locale);
            $rootScope.currentLang = locale;
        };

        // flag for needed request by next route change event
        $rootScope.requestNeeded = false;

        // route change event
        $rootScope.$on('$routeChangeStart', function (current, next) {

            // set activity and check session
            $bbcSession.setActivity(function (error) {

                // check session activity error
                if (error) {
                    $log.warn(error);
                    $rootScope.$emit('$sessionInactive');
                }
            });

            // when request needed is true than make a request with next route
            if ($rootScope.requestNeeded) {
                $window.location.assign(next.$$route.originalPath);
            }
        });

        // session inactive event, triggered when session inactive or lost
        $rootScope.$on('$sessionInactive', function() {
            $log.warn('next route change event triggers a server request.');
            $rootScope.requestNeeded = true;
        });

        // translate
        $rootScope.$on('$translateChangeSuccess', function() {
            tmhDynamicLocale.set($translate.use());
        });
    })
    .controller('GuideCtrl', function ($scope, $bbcTransport, $log) {

        $bbcTransport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
            else {
                $scope.awesomeThings = [];
                $log.error(error);
            }
        });

        $scope.view = 'app/guide/guide.html';
    })
    .controller('NavigationCtrl', function ($scope, $location) {
        $scope.menu = [
            { 'title': 'Home', 'link': '/guide/' },
            { 'title': 'bbc.alert', 'link': '/guide/alert' },
            { 'title': 'bbc.cache', 'link': '/guide/cache' },
            { 'title': 'bbc.float', 'link': '/guide/float' },
            { 'title': 'bbc.integer', 'link': '/guide/integer' },
            { 'title': 'bbc.navigation', 'link': '/guide/nav-home' },
            { 'title': 'bbc.session', 'link': '/guide/session' },
            { 'title': 'bbc.transport', 'link': '/guide/transport' }
        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    })
    .controller('AlertCtrl', function ($scope, $bbcAlert) {
        $scope.bbcAlert = $bbcAlert;
        $scope.showAlert = function(type) {
            $scope.bbcAlert[type]('Info message from controller');
        };
    });
//    .controller('CacheCtrl', function ($scope, $bbcCache) {
//        $scope.bbcCache = $bbcCache;
//        $scope.addToCache = function(user) {
//            $bbcCache['_user'] = user;
//        };
//
//        $scope.clearCache = function() {
//            delete $bbcCache['_user'];
//        };
//    })
//    .controller('DatepickerCtrl', function ($scope) {
//        $scope.date = new Date();
//        $scope.date.setMonth(2); //set March
//        $scope.date.setDate(12); //set the 12th
//
//    })
//    .controller('CheckboxCtrl', function ($scope) {
//        $scope.model1 = false;
//        $scope.model2 = true;
//        $scope.check2 = false;
//        $scope.model3 = true;
//    })
//    .controller('FloatCtrl', function ($scope) {
//        $scope.val = '1.23';
//        $scope.initialType = (typeof $scope.val);
//
//        $scope.$watch('val', function() {
//            $scope.currentType = (typeof $scope.val);
//        });
//    })
//    .controller('FormCtrl', function ($scope, $bbcForm) {
//        $scope.$bbcForm = $bbcForm('formEdit', '_id');
//        var person = { _id: 1, firstname: 'John', lastname: 'Doe' };
//        $scope.$bbcForm.setModel(person);
//
//        $scope.save = function() {
//            if($scope.$bbcForm.model.lastname !== 'Doe') {
//                $scope.$bbcForm.populateValidation($scope.form, [{ property: 'lastname', message: 'Lastname must be Doe.' }]);
//            }
//        };
//    })
//    .controller('IntegerCtrl', function ($scope) {
//        $scope.val = '1';
//        $scope.initialType = (typeof $scope.val);
//
//        $scope.$watch('val', function() {
//            $scope.currentType = (typeof $scope.val);
//        });
//    })
//    .controller('PagerCtrl', function ($scope) {
//        $scope.initialPageSize = 10;
//        $scope.pagingOptions = {'skip': 0, 'limit': $scope.initialPageSize};
//
//        $scope.load = function (page) {
//            $scope.pagingOptions = page;
//            getData();
//        };
//
//        function getData() {
//            var items = [];
//            for(var i = 0; i < 100; i++) {
//                items.push({name: 'Item ' + (i + 1), index: i});
//            }
//
//            $scope.items = items.slice($scope.pagingOptions.skip, $scope.pagingOptions.skip + $scope.pagingOptions.limit);
//            $scope.count = 100;
//        }
//
//        getData();
//    })
//    .controller('RadioCtrl', function ($scope) {
//        $scope.disabled = false;
//        $scope.clickMe = function() {
//            $scope.disabled = !$scope.disabled;
//        };
//    })
//    .controller('MarkdownCtrl', function ($scope) {
//        $scope.markdown = '###Hallo'
//    })
//    .controller('SortCtrl', function ($scope) {
//        $scope.sortOpts = {'name': -1};
//
//        $scope.items = [
//            { name: 'John Doe', city: 'New York', country: 'USA' },
//            { name: 'Tina Tester', city: 'Leipzig', country: 'Germany' },
//            { name: 'Sam Sample', city: 'Sydney', country: 'Australia' },
//            { name: 'Max Mustermann', city: 'Toronto', country: 'Kanada' }
//        ];
//
//        $scope.sort = function (sort) {
//            $scope.sortOpts = sort;
//            var key = '';
//            for (var propName in sort) {
//                key = propName;
//                break;
//            }
//
//            $scope.items.sort(function(a, b) {
//                var x = a[key];
//                var y = b[key];
//
//                return sort[key] === -1 ? (x < y) : (x > y);
//            });
//        };
//
//        $scope.sort($scope.sortOpts);
//    })
//    .controller('InlineEditCtrl', function ($scope, $bbcInlineEdit) {
//        $scope.inlineEdit = $bbcInlineEdit();
//
//        $scope.items = [
//            { _id : 1, name: 'John Doe', city: 'New York', country: 'USA' },
//            { _id : 2, name: 'Tina Tester', city: 'Leipzig', country: 'Germany' },
//            { _id : 3, name: 'Sam Sample', city: 'Sydney', country: 'Australia' },
//            { _id : 4, name: 'Max Mustermann', city: 'Toronto', country: 'Kanada' }
//        ];
//
//        $scope.save = function(item) {
//            for(var i = 0; i < $scope.items.length; i++) {
//                if(item._id === $scope.items[i]._id) {
//                    $scope.items[i] = item;
//                    $scope.inlineEdit.model = null;
//                    break;
//                }
//            }
//        }
//    })
//    .controller('ResetCtrl', function () {
//    })
//    .controller('ModalCtrl', function ($scope, $bbcModal, $translate, $rootScope) {
//        var message = '';
//        var updatedMessage = '';
//
//        $rootScope.$on('$translateChangeSuccess', function () {
//            $translate('MODAL_HEADLINE').then(function (headline) {
//                options.headline = headline;
//            });
//            $translate('MODAL_MESSAGE_BODY').then(function (message) {
//                options.message = message;
//            });
//            $translate('MODAL_YES_TEXT').then(function (text) {
//                buttonTextValues.yes = text;
//            });
//            $translate('MODAL_NO_TEXT').then(function (text) {
//                buttonTextValues.no = text;
//            });
//            $translate('MODAL_CLOSE_TEXT').then(function (text) {
//                buttonTextValues.close = text;
//            });
//            $translate('MODAL_CLICKED_TEXT').then(function (text) {
//                message = text;
//            });
//            $translate('MODAL_UPDATED_MESSAGE').then(function (text) {
//                updatedMessage = text;
//            });
//        });
//
//        $translate.use('en-us');
//        $scope.message = '';
//        var buttonTextValues = { ok: 'Ok' };
//        var options = { id: 'uniqueId', backdrop: false, buttonTextValues: buttonTextValues };
//
//        $scope.popupYesNo = function() {
//            options.callObj = {
//                cbYes: function () {
//                    $scope.message = buttonTextValues.yes + ' ' + message;
//                },
//                cbNo: function () {
//                    $scope.message = buttonTextValues.no + ' ' + message;
//                }
//            };
//            $bbcModal.open(options);
//        };
//
//        $scope.popupOkClose = function(){
//            options.callObj = {
//                cbOk: function () {
//                    $scope.message = buttonTextValues.ok + ' ' + message;
//                },
//                cbClose: function () {
//                    $scope.message = buttonTextValues.close + ' ' + message;
//                }
//            };
//            $bbcModal.open(options);
//        };
//
//        $scope.popupModal = function(){
//            options.backdrop = true;
//            options.callObj = {
//                cbOk: function () {
//                    $scope.message = buttonTextValues.ok + ' ' + message;
//                }
//            };
//            $bbcModal.open(options);
//        };
//
//        $scope.popupWithCancel = function(){
//            options.backdrop = true;
//            $bbcModal.open(options);
//
//            setTimeout(function() {
//                $bbcModal.cancel();
//            }, 1000);
//        };
//
//        $scope.popupModalUpdate = function() {
//            options.backdrop = true;
//            options.callObj = {
//                cbOk: function () {
//                    $scope.message = buttonTextValues.ok + ' ' + message;
//                }
//            };
//            $bbcModal.open(options);
//
//            setTimeout(function(){
//                $bbcModal.update('uniqueId', updatedMessage);
//            }, 2000);
//        };
//    })
//    .controller('NavHomeCtrl', function ($scope, $rootScope) {
//
//        $rootScope.socketEnabled = false;
//    })
//    .controller('NavAdminCtrl', function ($scope, $rootScope) {
//
//        $rootScope.socketEnabled = false;
//    })
//    .controller('RestCtrl', function ($scope, $location) {
//        $scope.isActive = function (route) {
//            return route === $location.path();
//        };
//    })
//    .controller('TransportCtrl', function ($rootScope, $scope, $location, $bbcTransport) {
//        $scope.messages = [];
//        $scope.raiseError = false;
//
//        $bbcTransport.forward('connect', $scope);
//        $bbcTransport.forward('disconnect', $scope);
//
//        $scope.$on('socket:connect', function() {
//            $scope.messages.push({message: 'CONNECT:  connection successfully'});
//        });
//
//        $scope.$on('socket:disconnect', function() {
//            $scope.messages.push({message: 'CONNECT: connection lost'});
//            $rootScope.socketEnabled = false;
//        });
//
//        $scope.setSocketState = function(){
//            $rootScope.socketEnabled = !$rootScope.socketEnabled;
//        };
//
//        $bbcTransport.on('news', function (data) {
//            $scope.messages.push({message: 'NEWS: ' + data});
//        });
//
//        $scope.clear = function() {
//            $scope.messages = [];
//        };
//
//        $scope.send = function() {
//            $scope.messages.push({class:'sent', message: 'SENT: ' + $scope.message});
//
//            $bbcTransport.emit('api/echo', {message: $scope.message, error: $scope.raiseError}, function(error, result) {
//                if(error){
//                    $scope.messages.push({class: 'error', message: error.data});
//                } else if(result){
//                    $scope.messages.push({class: 'response', message: 'RESPONSE: ' + result.message});
//                }
//            });
//        };
//
//        $scope.isActive = function (route) {
//            return route === $location.path();
//        };
//    })
//    .controller('SessionCtrl', function ($scope, $bbcSession) {
//        $scope.activityMessages = [];
//
//        $scope.clearActivity = function() {
//            $scope.activityMessages = [];
//        };
//
//        $scope.getLastActivity = function() {
//            $scope.activityMessages.push({class:'sent', message: 'SENT: ' + 'getLastActivity'});
//
//            $bbcSession.getLastActivity(function(error, data) {
//
//                if(error) {
//                    $scope.activityMessages.push({class:'error', message: error});
//                }
//                else {
//                    var now = new Date(data.activity);
//                    $scope.activityMessages.push({class: 'response', message: 'RESPONSE: ' + 'last activity is ' + now});
//                }
//            });
//        };
//
//        $scope.setActivity = function() {
//            var now = new Date();
//            $scope.activityMessages.push({class:'sent', message: 'SENT: ' + 'set activity to ' + now});
//
//            $bbcSession.setActivity(function(error) {
//                if(error) {
//                    $scope.activityMessages.push({class:'error', message: error});
//                }
//                else {
//                    $scope.activityMessages.push({class: 'response', message: 'RESPONSE: true'});
//
//                    $scope.apply = function() {
//                        $scope.data.key = '';
//                        $scope.data.value = '';
//                    };
//                }
//            });
//        };
//
//        $scope.dataMessages = [];
//
//        $scope.clearData = function() {
//            $scope.dataMessages = [];
//        };
//
//        $scope.getData = function () {
//            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
//                $scope.data.key.length === 0) {
//
//                $scope.dataMessages.push({class:'sent', message: 'SENT: ' + 'get all session data'});
//
//                $bbcSession.getData(function (error, result) {
//                    if (error) {
//                        $scope.dataMessages.push({class:'error', message: error});
//                    }
//                    else {
//                        $scope.dataMessages.push({class:'response', message: 'RESPONSE: '});
//                        $scope.dataMessages.push({class:'response', message: result});
//                    }
//                });
//            }
//            else {
//                $scope.dataMessages.push({class:'sent', message: 'SENT: ' + 'get key: ' + $scope.data.key});
//
//                $bbcSession.getData($scope.data.key, function (error, result) {
//                    if (error) {
//                        $scope.dataMessages.push({class:'error', message: error});
//                    }
//                    else {
//                        $scope.dataMessages.push({class:'response', message: 'RESPONSE: ' });
//                        $scope.dataMessages.push({class:'response', message: result});
//                    }
//                });
//            }
//        };
//
//        $scope.setData = function () {
//            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
//                $scope.data.key.length === 0 || typeof $scope.data.value === 'undefined' ||
//                $scope.data.value.length === 0) {
//
//                $scope.dataMessages.push({class:'error', message: 'ERROR: ' + 'for save in session is key and value required'});
//            }
//            else {
//                $scope.dataMessages.push({class:'sent', message: 'SENT: ' + 'setData' + 'key:' + $scope.data.key + ' value:' + $scope.data.value});
//
//                $bbcSession.setData($scope.data.key, $scope.data.value, function (error, result) {
//                    if(error) {
//                        $scope.activityMessages.push({class:'error', message: error});
//                    }
//                    else {
//                        $scope.dataMessages.push({class:'response', message: 'RESPONSE: ' + result});
//                    }
//                });
//            }
//        };
//
//        $scope.deleteData = function () {
//            if (typeof $scope.data === 'undefined' || typeof $scope.data.key === 'undefined' ||
//                $scope.data.key.length === 0) {
//
//                $scope.dataMessages.push({class:'sent', message: 'SENT: ' + 'set no key, delete all objects in session.data'});
//
//                $bbcSession.deleteData(function (error, result) {
//                    if (error) {
//                        $scope.activityMessages.push({class:'error', message: error});
//                    }
//                    else {
//                        $scope.dataMessages.push({class:'response', message: 'RESPONSE: ' + result});
//                    }
//                });
//            }
//            else {
//                $scope.dataMessages.push({class: 'sent', message: 'SENT: ' + 'delete ' + $scope.data.key + ' in session.data'});
//
//                $bbcSession.deleteData($scope.data.key, function (error, result) {
//                    if (error) {
//                        $scope.activityMessages.push({class: 'error', message: error});
//                    }
//                    else {
//                        $scope.dataMessages.push({class: 'response', message: 'RESPONSE: ' + result});
//                    }
//                });
//            }
//        };
//    });