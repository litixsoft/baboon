angular.module('enterprise.services', [])
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
    })
    .factory('enterpriseCrew', function (socket) {
        var pub = {},
            enterprise = [];

        pub.getAll = function(callback) {
            if(typeof enterprise === 'undefined' || enterprise.length === 0 ) {
                socket.emit('enterprise:getAll',{}, function(data) {
                    enterprise = data;
                    callback(data);
                });
            }
            else {
                callback(enterprise);
            }
        };

        pub.getById = function(id, callback) {
            if(typeof enterprise === 'undefined' || enterprise.length === 0 ) {
                socket.emit('enterprise:getAll',{}, function(data) {
                    enterprise = data;
                    callback(enterprise[id]);
                });
            }
            else {
                callback(enterprise[id]);
            }
        };

        pub.updateById = function(id, person, callback) {
            socket.emit('enterprise:updateById',{id: id, person: person}, function(data) {
                enterprise[id] = person;
                callback(data);
            });
        };

        pub.create = function(person, callback) {
            socket.emit('enterprise:create',{person: person}, function(data) {
                if (!Array.isArray(enterprise)) {
                    enterprise = [];
                }

                enterprise.push(person);
                callback(data);
            });
        };

        return pub;
    });
