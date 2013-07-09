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

exports.register2 = function (socket, path, controller, resources) {
    // register resources
    lxHelpers.arrayForEach(resources, function (resource) {
        if (controller[resource]) {
            console.log('registered event: ' + path + '.' + resource);
            socket.on(path + '.' + resource, controller[resource]);
        }

//        lxHelpers.objectForEach(controller, function (key, value) {
//            if (resource === key) {
//                console.log('registered event: ' + path + '.' + key);
//                socket.on(path + '.' + key, value);
//            }
//        });
    });
};
