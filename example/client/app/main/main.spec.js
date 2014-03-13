'use strict';

describe('App main', function () {

    //var $httpBackend;

    beforeEach(module('main'));
    beforeEach(module('bbc.transport'));

//    beforeEach(inject(function (_$httpBackend_) {
//        $httpBackend = _$httpBackend_;
//        $httpBackend.expectGET('/assets/bower_components/angular-i18n/angular-locale_en-us.js').respond(
//            {
//                'DATETIME_FORMATS': {
//                    'AMPMS': ['AM', 'PM' ],
//                    'DAY': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
//                    'MONTH': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
//                    'SHORTDAY': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
//                    'SHORTMONTH': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
//                    'fullDate': 'EEEE, MMMM d, y',
//                    'longDate': 'MMMM d, y',
//                    'medium': 'MMM d, y h:mm:ss a',
//                    'mediumDate': 'MMM d, y',
//                    'mediumTime': 'h:mm:ss a',
//                    'short': 'M/d/yy h:mm a',
//                    'shortDate': 'M/d/yy',
//                    'shortTime': 'h:mm a'
//                },
//                'NUMBER_FORMATS': {
//                    'CURRENCY_SYM': '$',
//                    'DECIMAL_SEP': '.',
//                    'GROUP_SEP': ',',
//                    'PATTERNS': [
//                        {
//                            'gSize': 3,
//                            'lgSize': 3,
//                            'macFrac': 0,
//                            'maxFrac': 3,
//                            'minFrac': 0,
//                            'minInt': 1,
//                            'negPre': '-',
//                            'negSuf': '',
//                            'posPre': '',
//                            'posSuf': ''
//                        },
//                        {
//                            'gSize': 3,
//                            'lgSize': 3,
//                            'macFrac': 0,
//                            'maxFrac': 2,
//                            'minFrac': 2,
//                            'minInt': 1,
//                            'negPre': '(\u00a4',
//                            'negSuf': ')',
//                            'posPre': '\u00a4',
//                            'posSuf': ''
//                        }
//                    ]
//                },
//                'id': 'en-us',
//                'pluralCat': 'one'
//            }
//        );
//        $httpBackend.expectGET('/locale/main/locale-en-us.json').respond(200);
//    }));

    it('should map routes', function () {
        inject(function ($route) {
            expect($route.routes[null].redirectTo).toEqual('/');
        });
    });

    it('should html5 mode', function () {
        inject(function ($location) {
            expect($location.$$html5).toEqual(true);
        });
    });

//    it('should raise the $translateChangeSuccess event', function() {
//
//        var translate, tmhDynamicLocale, setTmp;
//
//        beforeEach(module('pascalprecht.translate'));
//        beforeEach(module('tmh.dynamicLocale'));
//
//        beforeEach(function() {
//                inject(function ($rootScope, $injector) {
//
//                    translate = $injector.get('$translate');
//                    tmhDynamicLocale = $injector('tmhDynamicLocale');
//                    translate.use = function() {
//                        return 'test';
//                    };
//                    tmhDynamicLocale.set =function(translate) {
//                        setTmp = translate;
//                    };
//
//                    spyOn($rootScope, '$emit');
//
//                    //expect($location.$$html5).toEqual(true);
//                });
//            }
//        );
//
//
//
//        //$httpBackend.flush();
//        //spyOn(scope, "$emit")
//        //run code to test
//        //expect(scope.$emit).toHaveBeenCalledWith("MY_EVENT_ID", other, possible, args);
//    });
});
