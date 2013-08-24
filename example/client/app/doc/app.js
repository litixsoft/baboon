/*global angular*/
angular.module('baboon.documentation', [
        'pascalprecht.translate',
        'ui.utils',
        'ui.bootstrap',
        'baboon.services',
        'baboon.directives',
        'ui.lxnavigation',
        'bbdoc'
    ])
    .config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/doc', {templateUrl: '/doc/doc.html',controller: 'docCtrl'});
        $routeProvider.otherwise({redirectTo: '/doc'});

        $translateProvider.useStaticFilesLoader({
            prefix: 'locale/locale-',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage('en');
        $translateProvider.fallbackLanguage('en');
    }])
    .run(['$rootScope', 'session', '$log', '$translate', function ($rootScope, session, $log, $translate) {
        $rootScope.$on('$routeChangeStart', function () {
            session.setActivity();
        });

        // get users preferred language from session
        session.getData('language', function (error, result) {
            if (error) {
                $log.error(error);
            }

            // use language
            if (result && result.language) {
                $translate.uses(result.language);
                $log.info('Language key loaded from session: ' + result.language);
            }
        });
    }])
    .controller('rootCtrl', ['$rootScope', 'msgBox', '$translate', 'session', function ($scope, msgBox, $translate, session) {
        $scope.modal = msgBox.modal;

        $scope.changeLanguage = function (langKey) {
            // tell angular-translate to use the new language
            $translate.uses(langKey);

            // save selected language in session
            session.setData('language', langKey);
        };
    }])
    .controller('navLoginCtrl', ['$scope', '$window', function ($scope,$window) {

        var window = angular.element($window);

        $scope.$watch('openMenu',function(newval){
            if(newval){
                window.bind('keydown',function(ev){
                    if ( ev.which === 27 ) { //ESC Key
                        $scope.$apply( function () {
                            $scope.openMenu = false;
                        });
                    }
                });
            } else {
                window.unbind('keydown');
            }
        });

        $scope.openMenu = false;

    }])
    .controller('docCtrl', ['$rootScope', '$http', function ($scope,$http) {

        $scope.linkList = [
            {title:'Baboon Installation',route:'/doc/md/first'},
            {title:'Baboon Dingens',route:'/doc/md/second'},
            {title:'Baboon Super',route:'/doc/md/third',children:[
                {title:'Super Doll',route:'/doc/md/fourth',children:[
                    {title:'Doll 1',route:'/doc/md/five'},
                    {title:'Doll 2',route:'/doc/md/six'},
                    {title:'Doll 3',route:'/doc/md/seven'}
                ]}
            ]},
            {title:'Baboon Eight',route:'/doc/md/eight'}
        ];

        $scope.markCode = {content: 'loading...'};

        $scope.openMdLink = function(path){
            $http({
                url: [
                    path,
                    '.md'
                ].join(''),
                method: 'GET',
                params: ''
            }).success(function (data) {
                    console.log(data.markdown);
                    $scope.markCode.content = data.markdown;
                    // deferred.resolve(data);
                }).error(function (data) {
                    console.log('Fehler: ' + data);
//                    deferred.reject(options.key);
                });
        };
        $scope.openMdLink('/doc/md/first');

    }]);
