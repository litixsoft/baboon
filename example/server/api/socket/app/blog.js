module.exports = function(socket, acl) {
    'use strict';

    var res = {},
        base = require('../base');

    /**
     * resource test
     * @param data
     * @param callback
     */
    res.test = function (data, callback) {
        var end = new Date().toTimeString();
        var res = {fromClient: data, fromServer: end};
        callback(res);
    };

    // register resources
    base.register('blog', socket, acl, res);
};