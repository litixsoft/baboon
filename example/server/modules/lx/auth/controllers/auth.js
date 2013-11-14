'use strict';

module.exports = function () {
    var pub = {};


    /**
     * Gets all members from db.
     *
     * @roles Admin, Guest
     * @description Gets all members from db
     * @param {object} data The query.
     * @param {!object} request The request object.
     * @param {!function(err, res)} request.getSession Returns the current session object.
     * @param {!function(result)} callback The callback.
     */
    pub.registerUser = function (data, request, callback) {
        callback(null,'registered');
    };

    return pub;
};