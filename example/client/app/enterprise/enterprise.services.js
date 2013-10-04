/*global angular*/
angular.module('app.enterprise.services', [])
    .factory('appEnterpriseCrew', ['lxSocket', 'app.enterprise.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getAll = function(query, callback) {
            lxSocket.emit(modulePath + 'enterprise/getAllMembers',{}, function(result) {
                callback(result);
            });
        };

        pub.getById = function(id, callback) {
            lxSocket.emit(modulePath + 'enterprise/getMemberById',{id: id}, function(result) {
                callback(result);
            });
        };

        pub.update = function(member, callback) {
            lxSocket.emit(modulePath + 'enterprise/updateMember', member, function(result) {
                callback(result);
            });
        };

        pub.create = function(member, callback) {
            lxSocket.emit(modulePath + 'enterprise/createMember', member, function(result) {
                callback(result);
            });
        };

        pub.createTestMembers = function(callback) {
            lxSocket.emit(modulePath + 'enterprise/createTestMembers', {}, function(result) {
                callback(result);
            });
        };

        pub.delete = function(id, callback) {
            lxSocket.emit(modulePath + 'enterprise/deleteMember', {id: id}, function(result) {
                callback(result);
            });
        };

        pub.deleteAllMembers = function(callback) {
            lxSocket.emit(modulePath + 'enterprise/deleteAllMembers', {}, function(result) {
                callback(result);
            });
        };

        return pub;
    }]);
