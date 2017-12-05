'use strict';

module.exports = function () {

    var pub = {};

    pub.getAll = function (data, request, callback) {
        callback(null, [data, request]);
    };

    return pub;
};