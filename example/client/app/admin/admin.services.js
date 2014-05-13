'use strict';

/*global angular*/
angular.module('admin.services', [])
    .factory('adminRights', function () {
        var pub = {};

        function convertRightStringToObject (selectedRights, rightObj, right, path) {
            var s = right.name.split('/');
            var mod = s.shift();
            path = path || '';

            if (s.length === 1) {
                rightObj[mod] = rightObj[mod] || [];
                right.display_name = s.shift();
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

        return pub;
    });