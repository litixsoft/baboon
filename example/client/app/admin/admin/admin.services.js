/*global angular*/
angular.module('admin.services', [])
    .factory('adminRights', ['lxTransport', 'admin.modulePath', function (transport, modulePath) {
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
            transport.emit(modulePath + 'right/getAll', query, callback);
        };

        pub.getById = function (id, callback) {
            transport.emit(modulePath + 'right/getById', {id: id}, callback);
        };

        pub.create = function (right, callback) {
            transport.emit(modulePath + 'right/create', right, callback);
        };

        pub.update = function (right, callback) {
            transport.emit(modulePath + 'right/update', right, callback);
        };

        pub.delete = function (right, callback) {
            transport.emit(modulePath + 'right/delete', right, callback);
        };

        return pub;
    }]);