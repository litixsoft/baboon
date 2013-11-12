'use strict';

module.exports = function () {
    var pub = {};


    /**
     * Gets all members from db.
     *
     * @roles Admin, Guest
     * @description Gets all members from db
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.registerUser = function (data, callback) {
        callback(null,'registered');
    };

    return pub;
};