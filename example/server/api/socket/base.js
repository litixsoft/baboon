'use strict';

exports.register = function(key, socket, acl, res) {
    var lxHelpers = require('lx-helpers');

    /**
     * register resources
     */

    lxHelpers.arrayForEach(acl.resources, function(resource) {
        lxHelpers.objectForEach(res, function(objKey, value) {
            if (resource === objKey) {
                socket.on(key + ':' + objKey, value);
            }
        });
    });

//    for(i = 0, max = acl.resources.length; i < max; i += 1) {
//        for(var prop in res) {
//            if(res.hasOwnProperty(prop)) {
//                if (acl.resources[i] === prop) {
//                    socket.on(key + ':' + prop, res[prop]);
//                }
//            }
//        }
//    }
};
