/*global angular, io*/
angular.module('baboon.core', [])
    // Modal window to show an message to the user
    .factory('msgBox', function () {
        var pub = {},
            modal = {
                opts: {
                    backdropClick: false,
                    backdropFade: true,
                    dialogFade: true
                }
            };

        /**
         * Closes the modal window and clears the error message/action.
         */
        modal.close = function () {
            modal.shouldBeOpen = false;
            modal.headline = '';
            modal.message = '';
            modal.type = '';
            modal.action = null;
        };

        /**
         * Opens the modal window.
         *
         * @param {string} headline The headline to show.
         * @param {string} message The message to show.
         * @param {string=} type The message type.
         * @param {function=} callback The callback action when click the ok button in the modal window.
         */
        modal.show = function (headline, message, type, callback) {
            modal.shouldBeOpen = true;
            modal.headline = headline || '';
            modal.message = message;
            modal.type = type || 'Error';
            modal.action = callback;
        };

        /**
         * Executes the action and closes the modal window
         */
        modal.ok = function () {
            if (typeof modal.action === 'function') {
                modal.action.call();
            }

            modal.close();
        };

        // api
        pub.modal = modal;

        return pub;
    })
    // Wrapper service for socket.io
    .factory('socket', ['$rootScope', '$window', '$location', '$log', 'msgBox', function ($rootScope, $window, $location, $log, msgBox) {
        var protocol = $window.location.protocol,
            hostname = $window.location.hostname,
            port = $window.location.port,
            transports = ['websocket', 'xhr-polling', 'jsonp-polling'];

        if (protocol === 'https') {
            protocol = 'wss';
        } else {
            protocol = 'ws';
        }

        // detect karma test runner and remove wensocket from transports (default karma port is 9876)
        if (port > 9870 && port < 9900 && hostname === 'localhost') {
            transports = ['xhr-polling', 'jsonp-polling'];
        }

        var host = protocol + '://' + hostname + ':' + port,
            socket = io.connect(host, {'connect timeout': 4000, 'transports': transports});

        // socket.io events
        socket.on('disconnect', function () {
            $log.error('Lost connection to Socket.IO');

            $rootScope.$apply(function () {
                msgBox.modal.show('Lost connection to server!','', 'Warning');
            });
        });

        socket.on('connect', function () {
            $log.log('socket.io connected with: ' + socket.socket.transport.name);
        });

        socket.on('connect_error', function (err) {
            $log.error('connect_error: ', err);

            $rootScope.$apply(function () {
                msgBox.modal.show('Could not connect to socket server!','', 'Error');
            });
        });

        socket.on('connect_timeout', function () {
            $log.error('connect_timeout...');
        });

        socket.on('reconnect', function (transport) {
            $log.log('socket.io reconnect with: ' + transport);

            $rootScope.$apply(function () {
                msgBox.modal.close();
            });
        });

        socket.on('reconnecting', function () {
            var reconnectionAttempts = arguments[1] || 0;
            $log.log('Try to reconnect with: ' + socket.socket.transport.name + ', attempt: ' + reconnectionAttempts);

            $rootScope.$apply(function () {
                if (reconnectionAttempts === 1) {
                    msgBox.modal.message += ' Trying to reconnect. Attempt: ' + reconnectionAttempts;
                } else {
                    msgBox.modal.message = msgBox.modal.message.replace((reconnectionAttempts - 1).toString(), reconnectionAttempts);
                }
            });
        });

        socket.on('reconnect_error', function (err) {
            $log.error('socket.io reconnect_error: ', err);
        });

        socket.on('reconnect_failed', function () {
            $log.error('socket.io reconnect_failed');
        });

        socket.on('site_reload', function () {
            $log.warn('Site Reload triggered by Server');

            $rootScope.$apply(function () {
                msgBox.modal.show('','Session is expired! Please reload the site.', 'Warning', function () {
                    window.location.reload();
                });
            });
        });

        // api
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
    }])
    // Super simple client cache
    .factory('cache', function () {
        return {};
    })
    // Service for session handling
    .factory('session', ['$rootScope', '$http', '$log', 'msgBox', function ($rootScope, $http, $log, msgBox) {
        var pub = {};

        // save key value in session
        pub.setData = function (key, value) {
            $http.post('/api/session/setData', {key: key, value: value})
                .success(function (data) {
                    $log.info(data.message);
                })
                .error(function (data) {
                    $log.error(data.message);
                });
        };

        // get key value from session
        pub.getData = function (key, callback) {
            $http.post('/api/session/getData', {key: key})
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (data, status) {
                    callback({status: status, data: data});
                });
        };

        // check session and set activity time
        pub.getLastActivity = function (callback) {
            $http.post('/api/session/getLastActivity')
                .success(function (data) {
                    callback(null, data);
                })
                .error(function (data, status) {
                    if (status === 500) {
                        $log.error(data.message);
                    } else {
                        $log.warn(data.message);
                    }
                });
        };

        // check session and set activity time
        pub.setActivity = function () {
            $http.post('/api/session/setActivity')
                .error(function (data, status) {
                    if (status === 500) {
                        $log.error(data.message);
                    } else {
                        $log.warn(data.message);
                    }

                    msgBox.modal.show('','Session is expired! Please log in.', 'Warning', function () {
                        window.location.assign('/login');
                    });
                });
        };

        return pub;
    }]);