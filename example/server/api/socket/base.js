'use strict';
var lxHelpers = require('lx-helpers');

exports.register = function (key, socket, acl, res) {
    // register resources
    lxHelpers.arrayForEach(acl.resources, function (resource) {
        lxHelpers.objectForEach(res, function (objKey, value) {
            if (resource === objKey) {
                socket.on(key + ':' + objKey, value);
            }
        });
    });
};
