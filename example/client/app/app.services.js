/*global angular, io*/
angular.module('app.services', [])
    .factory('socket', function ($rootScope, $window) {

        var protocol = $window.location.protocol;
        var hostname = $window.location.hostname;
        var port = $window.location.port;
        var transports = ['websocket', 'xhr-polling', 'jsonp-polling'];

        if(protocol === 'https') {
            protocol = 'wss';
        }
        else {
            protocol = 'ws';
        }

        // karma fix
        if(port > 9870 && port < 9900 && hostname === 'localhost') {
            transports = ['xhr-polling', 'jsonp-polling'];
        }

        var host = protocol + '://' + hostname + ':' + port;
        var socket = io.connect(host, {'connect timeout': 4000, 'transports': transports});

        socket.on('connect', function() {
            console.log('connect: ' + socket.socket.transport.name);
        });

        socket.on('connect_error', function(err) {
            console.log('connect_error: ' + err);
        });

        socket.on('connect_timeout', function() {
            console.log('connect_timeout...');
        });

        socket.on('reconnect', function(num) {
            console.log('reconnect: ' + num);
        });

        socket.on('reconnect_error', function(err) {
            console.log('reconnect_error: ' + err);
        });

        socket.on('reconnect_failed', function(){
            console.log('reconnect_failed');
        });

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