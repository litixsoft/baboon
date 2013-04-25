exports.register = function(key, socket, acl, res) {
    'use strict';

    var i, max;

    /**
     * register resources
     */
    for(i = 0, max = acl.resources.length; i < max; i += 1) {
        for(var prop in res) {
            if(res.hasOwnProperty(prop)) {
                if (acl.resources[i] === prop) {
                    socket.on(key + ':' + prop, res[prop]);
                }
            }
        }
    }
};
