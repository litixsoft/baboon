angular.module('app', ['templates-main','$strap.directives', 'ui.bootstrap', 'enterprise', 'blog', 'uiexamples', 'ui', 'ngGrid','kendo.directives'])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.otherwise({redirectTo: '/'});
    })
    .value('$strap.config', {
        datepicker: {
            format: 'M d, yyyy'
        }
    })
    .factory('socket', function ($rootScope) {

        var socket = io.connect();

        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    });
