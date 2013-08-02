'use strict';

var lxHelpers = require('lx-helpers'),
    path = require('path'),
    fs = require('fs');

/**
 * The socket api.
 *
 * @param {!object} app The baboon object.
 * @param {!object} app.server The server object.
 * @param {!object} app.config The config object.
 * @param {!object} app.logging.syslog The syslog object.
 */
module.exports = function (config, logging) {
    var pub = {};

    pub.register = function (socket, acl) {

        lxHelpers.forEach(acl, function (module, controllers) {
            var pp = path.join(config.path.modules, module);

            if (fs.existsSync(pp)) {
                var mo = require(pp);

                lxHelpers.forEach(controllers, function (ctrlName, actions) {
                    if (mo[ctrlName]) {
                        var ctrl = mo[ctrlName]({config: config, logging: logging});

                        lxHelpers.forEach(actions, function (action) {
                            if (ctrl[action]) {
                                socket.on(module + '/' + ctrlName + '/' + action, ctrl[action]);

                                logging.syslog.debug('socket: registered event %s', module + '/' + ctrlName + '/' + action);
                            }
                        });

                    }
                });
            }
        });
    };

    return pub;
};
