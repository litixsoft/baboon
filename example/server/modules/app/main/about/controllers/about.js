'use strict';

module.exports = function (baboon) {

    var pub = {};

    pub.placeholderForRights = function(data, request, callback) {
        callback(data, request, baboon.config);
    };

    return pub;

};
