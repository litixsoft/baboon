module.exports = function (socket, acl) {
    'use strict';

    var res = {},
        lxDb = require('lx-mongodb'),
        blogConnection = 'localhost/blog?w=1&journal=True&fsync=True',
        repo = require('../../../repositories').blog(lxDb, blogConnection),
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