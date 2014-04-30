'use strict';

angular.module('apidoc', [
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
            .when('/apidoc', { templateUrl: 'app/apidoc/apidoc.html', controller: 'ApidocCtrl' });

        for(var z = 0; z < apiNav.length; z++){
            $routeProvider.when('/apidoc/'+apiNav[z].link+'', { templateUrl: 'app/apidoc/parts/lib/'+apiNav[z].link+'.js.html'})
        }
        // .when('/apidoc/baboon', { templateUrl: 'app/apidoc/parts/lib/baboon.js.html'})
        // .when('/apidoc/config', { templateUrl: 'app/apidoc/parts/lib/config.js.html'})
        // ......
        $routeProvider.otherwise({
                redirectTo: '/apidoc'
            });

        $locationProvider.html5Mode(true);

        $bbcNavigationProvider.set({
            app: 'apidoc',
            route: '/apidoc'
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
    .controller('NavigationCtrl', function ($scope, $location, $http) {

//        $bbcTransport
//        var mainInfo = $http.get('parts/navigation.json').success(function(response) {
            console.log(apiNav);
//        });
        $scope.menu = apiNav;

//        $scope.menu = [
//            { 'title': 'lib/baboon.js', 'link': '/apidoc/baboon', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/baboon#exports' },
//                { 'title': 'getServer', 'link': '/apidoc/baboon#getServer' },
//                { 'title': 'appListen', 'link': '/apidoc/baboon#appListen' }
//            ] },
//            { 'title': 'lib/config.js', 'link': '/apidoc/config', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/config#exports' }
//            ] },
//            { 'title': 'lib/errors.js', 'link': '/apidoc/errors', 'vis':false, 'children':[
//                { 'title': 'ConfigError', 'link': '/apidoc/errors#ConfigError' },
//                { 'title': 'LogError', 'link': '/apidoc/errors#LogError' },
//                { 'title': 'MailError', 'link': '/apidoc/errors#MailError' },
//                { 'title': 'NavigationError', 'link': '/apidoc/errors#NavigationError' },
//                { 'title': 'RightsError', 'link': '/apidoc/errors#RightsError' },
//                { 'title': 'SessionError', 'link': '/apidoc/errors#SessionError' },
//                { 'title': 'TransportError', 'link': '/apidoc/errors#TransportError' },
//                { 'title': 'ControllerError', 'link': '/apidoc/errors#ControllerError' }
//            ] },
//            { 'title': 'lib/logging.js', 'link': '/apidoc/logging', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/logging#exports' },
//                { 'title': 'setAppender', 'link': '/apidoc/logging#setAppender' }
//            ] },
//            { 'title': 'lib/mail.js', 'link': '/apidoc/mail', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/mail#exports' },
//                { 'title': 'sendMail', 'link': '/apidoc/mail#sendMail' },
//                { 'title': 'sendMailFromTemplate', 'link': '/apidoc/mail#sendMailFromTemplate' }
//            ] },
//            { 'title': 'lib/navigation.js', 'link': '/apidoc/navigation', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/navigation#exports' },
//                { 'title': 'addNavObj', 'link': '/apidoc/navigation#addNavObj' },
//                { 'title': 'checkNav', 'link': '/apidoc/navigation#checkNav' },
//                { 'title': 'getTree', 'link': '/apidoc/navigation#getTree' },
//                { 'title': 'getList', 'link': '/apidoc/navigation#getList' },
//                { 'title': 'getTopList', 'link': '/apidoc/navigation#getTopList' },
//                { 'title': 'getSubTree', 'link': '/apidoc/navigation#getSubTree' },
//                { 'title': 'getSubList', 'link': '/apidoc/navigation#getSubList' }
//            ] },
//            { 'title': 'lib/rights.js', 'link': '/apidoc/rights', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/rights#exports' },
//                { 'title': 'getUserRights', 'link': '/apidoc/rights#getUserRights' },
//                { 'title': 'getUserAcl', 'link': '/apidoc/rights#getUserAcl' },
//                { 'title': 'userHasAccessTo', 'link': '/apidoc/rights#userHasAccessTo' },
//                { 'title': 'userIsInRole', 'link': '/apidoc/rights#userIsInRole' },
//                { 'title': 'getAclObj', 'link': '/apidoc/rights#getAclObj' },
//                { 'title': 'secureNavigation', 'link': '/apidoc/rights#secureNavigation' },
//                { 'title': 'getRepositories', 'link': '/apidoc/rights#getRepositories' },
//                { 'title': 'getUserForLogin', 'link': '/apidoc/rights#getUserForLogin' },
//                { 'title': 'getUser', 'link': '/apidoc/rights#getUser' },
//                { 'title': 'getExtendedAcl', 'link': '/apidoc/rights#getExtendedAcl' },
//                { 'title': 'getExtendedAcl', 'link': '/apidoc/rights#getExtendedAcl' },
//                { 'title': 'getPublicFunctionsFromControllers', 'link': '/apidoc/rights#getPublicFunctionsFromControllers' },
//                { 'title': 'refreshRightsIdDb', 'link': '/apidoc/rights#refreshRightsIdDb' },
//                { 'title': 'ensureThatDefaultSystemUsersExists', 'link': '/apidoc/rights#ensureThatDefaultSystemUsersExists' }
//            ] },
//            { 'title': 'lib/session.js', 'link': '/apidoc/session', 'vis':false, 'children':[
//                { 'title': 'getSessionStore', 'link': '/apidoc/session#getSessionStore' },
//                { 'title': 'getSessionId', 'link': '/apidoc/session#getSessionId' },
//                { 'title': 'getSession', 'link': '/apidoc/session#getSession' },
//                { 'title': 'getSessionById', 'link': '/apidoc/session#getSessionById' },
//                { 'title': 'setSession', 'link': '/apidoc/session#setSession' },
//                { 'title': 'checkActivitySession', 'link': '/apidoc/session#checkActivitySession' },
//                { 'title': 'setActivity', 'link': '/apidoc/session#setActivity' },
//                { 'title': 'getLastActivity', 'link': '/apidoc/session#getLastActivity' },
//                { 'title': 'getData', 'link': '/apidoc/session#getData' },
//                { 'title': 'setData', 'link': '/apidoc/session#setData' },
//                { 'title': 'deleteData', 'link': '/apidoc/session#deleteData' }
//            ] },
//            { 'title': 'lib/settings.js', 'link': '/apidoc/settings', 'vis':false, 'children':[
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'exports', 'link': '/apidoc/settings#exports' },
//                { 'title': 'setUserSettings', 'link': '/apidoc/settings#setUserSettings' },
//                { 'title': 'setUserSettingsFromRequest', 'link': '/apidoc/settings#setUserSettingsFromRequest' }
//            ] }
//        ];

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    })
    .controller('ApidocCtrl', function ($scope, $bbcTransport, $log) {

        $bbcTransport.emit('api/common/awesomeThings/index/getAll', function (error, result){
            if (!error && result) {
                $scope.awesomeThings = result;
            }
            else {
                $scope.awesomeThings = [];
                $log.error(error);
            }
        });

        $scope.view = 'app/apidoc/apidoc.html';
    });