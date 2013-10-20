'use strict';

var fs = require('fs'),
    path = require('path'),
    lxHelpers = require('lx-helpers');

/**
 * The socket api.
 *
 * @param {!object} app The baboon object.
 * @param {!object} app.server The server object.
 * @param {!object} app.config The config object.
 * @param {!object} app.logging.syslog The syslog object.
 */
module.exports = function (app) {
    var pub = {};

    /**
     * Registers all socket events based on the acl of the user.
     *
     * @param {!Object} socket The socket object.
     * @param {!function(string, Function)} socket.on The socket event registration function.
     * @param {Object} acl The user acl.
     */
    pub.register = function (socket, acl) {
        if (!lxHelpers.isObject(socket)) {
            throw lxHelpers.getTypeError('socket', lxHelpers.getType(socket), lxHelpers.getType({}));
        }

        // iterate over acl obj
        lxHelpers.forEach(acl, function (modulePath, controllers) {
            var pathToModule = path.join(app.config.path.modules, modulePath);

            // check path
            if (modulePath && fs.existsSync(pathToModule)) {
                // load module
                var module = require(pathToModule);

                // iterate over each controller in the acl module
                lxHelpers.forEach(controllers, function (controllerName, actions) {
                    // check if module contains the contoller
                    if (module[controllerName]) {
                        // init controller
                        var controller = module[controllerName](app);

                        // iterate over each action in the acl controller
                        lxHelpers.forEach(actions, function (actionName) {
                            // check if controller contains the action
                            if (controller && controller[actionName]) {
                                var eventName = modulePath + '/' + controllerName + '/' + actionName;

                                // register socket event
//                                socket.on(eventName, controller[actionName]);
                                socket.on(eventName, function(data, callback) {
                                    app.logging.syslog.debug('socket: received event from client: %s | data: %j', eventName, data);
                                    controller[actionName](data, callback);
                                });
                                app.logging.syslog.debug('socket: registered event %s', eventName);
                            }
                        });
                    }
                });
            }
        });
    };

    return pub;
};
