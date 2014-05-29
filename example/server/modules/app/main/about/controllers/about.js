'use strict';

module.exports = function (baboon) {

    var pub = {};

    /**
     * Placeholder
     *
     * @roles Guest
     * @description Placeholder for rights system
     * @param {object} data The member data.
     * @param {!object} request The request object.
     * @param {!function(result)} callback The callback.
     */
    pub.placeholder = function(data, request, callback) {
        callback(data, request, baboon.config);
    };

    return pub;
};
