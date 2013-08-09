/*global angular*/
angular.module('enterprise.services', [])
    .factory('enterpriseCrew', ['socket', 'enterprise.modulePath', function (socket, modulePath) {
        var pub = {},
            enterprise = [];

        pub.getAll = function(callback) {
            if(typeof enterprise === 'undefined' || enterprise.length === 0 ) {
                socket.emit(modulePath + 'enterprise/getAll',{}, function(data) {
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
                socket.emit(modulePath + 'enterprise/getAll',{}, function(data) {
                    enterprise = data;
                    callback(enterprise[id]);
                });
            }
            else {
                callback(enterprise[id]);
            }
        };

        pub.updateById = function(id, person, callback) {
            socket.emit(modulePath + 'enterprise/updateById',{id: id, person: person}, function(data) {
                enterprise[id] = person;
                callback(data);
            });
        };

        pub.create = function(person, callback) {
            socket.emit(modulePath + 'enterprise/create',{person: person}, function(data) {
                if (!Array.isArray(enterprise)) {
                    enterprise = [];
                }

                enterprise.push(person);
                callback(data);
            });
        };

        return pub;
    }]);
