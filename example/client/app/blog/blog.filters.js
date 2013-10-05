/*global angular */
angular.module('app.blog.filters', []).
    filter('notZero', function () {
        return function (items) {
            items = items || [];

            var i,
                res = [],
                length = items.length;

            for (i = 0; i < length; i++) {
                if (items[i].count > 0) {
                    res.push(items[i]);
                }
            }

            return res;
        };
    });