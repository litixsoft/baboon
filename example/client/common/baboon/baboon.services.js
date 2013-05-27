/*global angular, io*/
angular.module('baboon.services', [])
    .factory('socket', function ($rootScope, $window) {

        var protocol = $window.location.protocol;
        var hostname = $window.location.hostname;
        var port = $window.location.port;
        var transports = ['websocket', 'xhr-polling', 'jsonp-polling'];

        if (protocol === 'https') {
            protocol = 'wss';
        }
        else {
            protocol = 'ws';
        }

        // karma fix
        if (port > 9870 && port < 9900 && hostname === 'localhost') {
            transports = ['xhr-polling', 'jsonp-polling'];
        }

        var host = protocol + '://' + hostname + ':' + port;
        var socket = io.connect(host, {'connect timeout': 4000, 'transports': transports});

        socket.on('connect', function () {
            console.log('websocket connected with protocol: ' + socket.socket.transport.name);
        });

        socket.on('connect_error', function (err) {
            console.log('connect_error: ' + err);
        });

        socket.on('connect_timeout', function () {
            console.log('connect_timeout...');
        });

        socket.on('reconnect', function (num) {
            console.log('reconnect: ' + num);
        });

        socket.on('reconnect_error', function (err) {
            console.log('reconnect_error: ' + err);
        });

        socket.on('reconnect_failed', function () {
            console.log('reconnect_failed');
        });

        socket.on('site_reload', function () {
            window.location.reload();
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
    })
    .factory('cache', function () {
        return {};
    })
    .factory('lxPager', function () {
        return function (model) {
            var pub = {};

            pub.currentPage = 1;
            pub.count = 0;
            pub.pageSize = 5;
            pub.pageSizes = [1, 2, 3, 4, 5, 10];

            pub.skip = function () {
                return (pub.currentPage - 1) * pub.pageSize;
            };

            pub.numberOfPages = function () {
                if (pub.pageSize < 1) {
                    pub.pageSize = 1;
                }

                return Math.ceil(pub.count / pub.pageSize);
            };

            pub.getOptions = function () {
//                var params = model.params || {};

                return {
                    limit: pub.pageSize,
                    skip: pub.skip()
//                    fields: params.fields,
//                    sortBy: params.sortBy,
//                    sort: params.sort
                };
            };

            pub.getAll = function () {
                model.service.getAllWithCount({
                    params: (model.params || {}).filter || {},
                    options: pub.getOptions()
                }, function (result) {
                    if (result.count) {
                        pub.count = result.count;
                    }

                    model.callback(result);
                });
            };

            pub.nextPage = function () {
                var currentPage = pub.currentPage;
                var count = currentPage * pub.pageSize;

                if (count < pub.count) {
                    pub.currentPage = ++currentPage;
//                    pub.getAll();
                }
            };

            pub.previousPage = function () {
                var currentPage = pub.currentPage;

                if (currentPage !== 1) {
                    pub.currentPage = --currentPage;
//                    pub.getAll();
                }
            };

            pub.firstPage = function () {
                pub.currentPage = 1;
//                pub.getAll();
            };

            pub.lastPage = function () {
                pub.currentPage = pub.numberOfPages();
            };

            return pub;
        };
    })
    .factory('lxForm', ['cache', function (cache) {
        return function (modelName) {
            var pub = {},
                master = {};

            pub.model = {};

            pub.reset = function () {
                pub.model = angular.copy(master);

                if (pub.model._id) {
                    cache[pub.model._id] = pub.model;
                } else {
                    cache[modelName] = pub.model;
                }
            };

            pub.isUnchanged = function () {
                return angular.equals(pub.model, master);
            };

            pub.loadFromCache = function (id) {
                if (id && cache[id]) {
                    pub.model = cache[id];

                    if (cache[id + '_Master']) {
                        master = cache[id + '_Master'];
                    }

                    return true;
                } else if (!id && cache[modelName]) {
                    pub.model = cache[modelName];

                    return true;
                }

                cache[id || modelName] = pub.model;

                return (!id) ? true : false;
            };

            pub.setModel = function (model, resetCache) {
                pub.model = model;
                master = angular.copy(model);

                if (resetCache) {
                    delete cache[model._id];
                    delete cache[model._id + '_Master'];
                } else {
                    cache[model._id] = pub.model;
                    cache[model._id + '_Master'] = master;
                }
            };

            pub.populateValidation = function(form, errors) {
                if (errors) {
                    for (var i = 0; i < errors.length; i++) {
                        form[errors[i].property].$invalid = true;
                        form[errors[i].property].$dirty = true;
                    }
                }
            };

            return pub;
        };
    }])
    .factory('session', ['socket', function (socket) {
        var pub = {};

        console.log('session started');

        pub.getAll = function(callback) {
            socket.emit('session:getAll', {}, callback);
        };

        pub.setData = function(data, callback) {
            socket.emit('session:setData', data, callback);
        };

        pub.getData = function(key, callback) {
            socket.emit('session:getData', key, callback);
        };

        pub.setActivity = function() {
            socket.emit('session_activity', function(err) {
                console.log(err);
            });
        };

        return pub;
    }]);
