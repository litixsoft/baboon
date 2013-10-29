'use strict';

var lxHelpers = require('lx-helpers'),
    path = require('path'),
    fs = require('fs');

module.exports = function (app) {
    var pub = {};

    function getControllerPath (fullPathToControllerFile) {
        if (!fs.existsSync(fullPathToControllerFile)) {
            return null;
        }

        var modulePath = '';
        var splittedFile = fullPathToControllerFile.split(path.sep);
        var controllerName = splittedFile.pop();

        if (controllerName.indexOf('.js') > 0) {
            controllerName = controllerName.replace('.js', '');
            splittedFile.pop();
        }

        var moduleName = splittedFile.pop();
        var i = splittedFile.length - 1;

        while (splittedFile[i] !== 'modules') {
            modulePath = splittedFile[i] + '/' + modulePath;
            i--;
        }

        return modulePath + moduleName + '/' + controllerName;
    }

    pub.parseRoute = function (route) {
        route = route || '';

        if (typeof route !== 'string') {
            throw lxHelpers.getTypeError('route', route, '');
        }

        var parts = route.split('/');

        return {
            action: parts.pop(),
            controllerName: parts[parts.length - 1],
            controllerFullPath: parts.join('/')
        };
    };

    pub.parseError = function (error, data) {
        if (error) {
            if (error instanceof Error) {
                app.logging.syslog.error('Server error: %s, data: %j' + error.message, data);
                return 'Server error';
            }

            if (error.validation) {
                return error;
            }

            // log dev errors
            if (typeof error === 'string') {
                app.logging.syslog.debug('Server error: %s, data: %j' + error.message, data);
            }

            return 'Server error';
        }

        return null;
    };

    pub.initAppControllers = function () {
        var grunt = require('grunt'),
            pattern = app.config.path.modules + '/**/controllers/*.js',
            controllers = grunt.file.expand(pattern),
            result = {};

        lxHelpers.forEach(controllers, function (controllerFile) {
            if (fs.existsSync(controllerFile)) {
                // get controller path, e.g. app/blog/blog
                var controllerPath = getControllerPath(controllerFile);

                if (controllerPath) {
                    // init controller and store in result
                    result[controllerPath] = require(controllerFile)(app);
                }
            }
        });

        return result;
    };

    // Function zum Registrieren der Socket events
    pub.registerSocketEvents = function (socket, acl, controllers, user) {
        if (!lxHelpers.isObject(socket)) {
            throw lxHelpers.getTypeError('socket', lxHelpers.getType(socket), lxHelpers.getType({}));
        }

        // iterate over acl obj
        lxHelpers.forEach(acl, function (modulePath, controllersNames) {
            var pathToModule = path.join(app.config.path.modules, modulePath);

            // iterate over each controller in the acl module
            lxHelpers.forEach(controllersNames, function (controllerName, actions) {
                // get controller

                var controller;
                var controllerPath = getControllerPath(pathToModule + '/' + controllerName);

                if (controllerPath) {
                    controller = controllers[controllerPath];
                }

                if (controller) {
                    // iterate over each action in the acl controller
                    lxHelpers.forEach(actions, function (actionName) {
                        // check if controller contains the action
                        if (controller[actionName]) {
                            var eventName = modulePath + '/' + controllerName + '/' + actionName;

                            // register socket event
                            socket.on(eventName, function (data, callback) {
                                app.logging.syslog.debug('socket: received event from client: %s | data: %j', eventName, data);

                                // add user object from session to data object
                                data.user = user;

                                controller[actionName](data, function (error, result) {
                                    callback({error: pub.parseError(error, data), data: result});
                                });
                            });

                            app.logging.syslog.info('socket: registered event %s', eventName);
                        }
                    });
                }
            });
        });
    };

    pub.socket = require('./socket');

    return pub;
};

//module.exports.socket = require('./socket');

