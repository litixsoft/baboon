/*global angular*/
angular.module('baboon.admin.services', [])
    .factory('baboon.admin.users', ['socket', function (socket) {
        var pub = {};

        pub.getAll = function (query, callback) {
            socket.emit('baboon/admin/user/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit('baboon/admin/user/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (user, callback) {
            socket.emit('baboon/admin/user/create', user, function (result) {
                callback(result);
            });
        };

        pub.update = function (user, callback) {
            socket.emit('baboon/admin/user/update', user, function (result) {
                callback(result);
            });
        };

        pub.delete = function (user, callback) {
            socket.emit('baboon/admin/user/delete', user, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('baboon.admin.rights', ['socket', function (socket) {
        var pub = {};

        function convertRightStringToObject (selectedRights, rightObj, right, path) {
            var s = right.name.split('/');
            var mod = s.shift();
            path = path || '';

            if (s.length === 1) {
                rightObj[mod] = rightObj[mod] || [];
                right.displayName = s.shift();
                right.isSelected = selectedRights.indexOf(right._id) > -1 ? true : false;
                right.name = path + right.name;
                rightObj[mod].push(right);
            } else {
                path += mod + '/';
                rightObj[mod] = rightObj[mod] || {children: {}};
                convertRightStringToObject(selectedRights, rightObj[mod].children, {_id: right._id, name: s.join('/')}, path);
            }
        }

        pub.convertToRightsObject = function (rights, selectedRights) {
            var res = {};
            selectedRights = selectedRights || [];

            var i;
            var length = rights.length;

            for (i = 0; i < length; i++) {
                convertRightStringToObject(selectedRights, res, rights[i]);
            }

//            console.log(res);
            return res;
        };

        pub.getAll = function (query, callback) {
            socket.emit('baboon/admin/right/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit('baboon/admin/right/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (right, callback) {
            socket.emit('baboon/admin/right/create', right, function (result) {
                callback(result);
            });
        };

        pub.update = function (right, callback) {
            socket.emit('baboon/admin/right/update', right, function (result) {
                callback(result);
            });
        };

        pub.delete = function (right, callback) {
            socket.emit('baboon/admin/right/delete', right, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('baboon.admin.groups', ['socket', function (socket) {
        var pub = {};

        pub.getAll = function (query, callback) {
            socket.emit('baboon/admin/group/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            socket.emit('baboon/admin/group/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (group, callback) {
            socket.emit('baboon/admin/group/create', group, function (result) {
                callback(result);
            });
        };

        pub.update = function (group, callback) {
            socket.emit('baboon/admin/group/update', group, function (result) {
                callback(result);
            });
        };

        pub.delete = function (group, callback) {
            socket.emit('baboon/admin/group/delete', group, function (result) {
                callback(result);
            });
        };

        return pub;
    }]);
