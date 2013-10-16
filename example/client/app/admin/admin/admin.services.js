/*global angular*/
angular.module('admin.services', [])
    .factory('adminUsers', ['lxSocket', 'admin.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getAll = function (query, callback) {
            lxSocket.emit(modulePath + 'user/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'user/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (user, callback) {
            lxSocket.emit(modulePath + 'user/create', user, function (result) {
                callback(result);
            });
        };

        pub.update = function (user, callback) {
            lxSocket.emit(modulePath + 'user/update', user, function (result) {
                callback(result);
            });
        };

        pub.delete = function (user, callback) {
            lxSocket.emit(modulePath + 'user/delete', user, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('adminRights', ['lxSocket', 'admin.modulePath', function (lxSocket, modulePath) {
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
                right.description = right.description;
                rightObj[mod].push(right);
            } else {
                path += mod + '/';
                rightObj[mod] = rightObj[mod] || {children: {}};
                convertRightStringToObject(selectedRights, rightObj[mod].children, {_id: right._id, name: s.join('/'), description: right.description}, path);
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

            return res;
        };

        pub.getAll = function (query, callback) {
            lxSocket.emit(modulePath + 'right/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'right/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (right, callback) {
            lxSocket.emit(modulePath + 'right/create', right, function (result) {
                callback(result);
            });
        };

        pub.update = function (right, callback) {
            lxSocket.emit(modulePath + 'right/update', right, function (result) {
                callback(result);
            });
        };

        pub.delete = function (right, callback) {
            lxSocket.emit(modulePath + 'right/delete', right, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('adminGroups', ['lxSocket', 'admin.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getAll = function (query, callback) {
            lxSocket.emit(modulePath + 'group/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'group/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (group, callback) {
            lxSocket.emit(modulePath + 'group/create', group, function (result) {
                callback(result);
            });
        };

        pub.update = function (group, callback) {
            lxSocket.emit(modulePath + 'group/update', group, function (result) {
                callback(result);
            });
        };

        pub.delete = function (group, callback) {
            lxSocket.emit(modulePath + 'group/delete', group, function (result) {
                callback(result);
            });
        };

        return pub;
    }])
    .factory('adminRoles', ['lxSocket', 'admin.modulePath', function (lxSocket, modulePath) {
        var pub = {};

        pub.getAll = function (query, callback) {
            lxSocket.emit(modulePath + 'role/getAll', query, function (result) {
                callback(result);
            });
        };

        pub.getById = function (id, callback) {
            lxSocket.emit(modulePath + 'role/getById', {id: id}, function (result) {
                callback(result);
            });
        };

        pub.create = function (role, callback) {
            lxSocket.emit(modulePath + 'role/create', role, function (result) {
                callback(result);
            });
        };

        pub.update = function (role, callback) {
            lxSocket.emit(modulePath + 'role/update', role, function (result) {
                callback(result);
            });
        };

        pub.delete = function (role, callback) {
            lxSocket.emit(modulePath + 'role/delete', role, function (result) {
                callback(result);
            });
        };

        return pub;
    }]);
