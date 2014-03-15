'use strict';

var lxHelpers = require('lx-helpers'),
    TransportError = require('../errors').TransportError,
    fs = require('fs');

module.exports = function (baboon) {
    if (!baboon || !baboon.config) {
        throw new TransportError(400, '', 'Parameter baboon is required!');
    }

    var pub = {},
        PATH_API = 'api/',
        CONTROLLER_FILES = '/**/controllers/*.js',
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    /**
     * Returns the function parameters as strings in an array
     *
     * @param func
     * @returns {Array|{index: number, input: string}|Array}
     */
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g) || [];
    }

    /**
     * Return the controller path for the route
     *
     * @param fullPathToControllerFile
     * @param separator
     * @param controllerDirectory
     * @returns {*}
     */
    function getControllerPath(fullPathToControllerFile, separator, controllerDirectory) {
        var modulePath = '';
        var splittedFile = fullPathToControllerFile.split(separator);

        // get controller name and remove '.js' from file name
        var controllerName = splittedFile.pop().slice(0, -3);

        // remove controllerName
        splittedFile.pop();

        var moduleName = splittedFile.pop();
        var i = splittedFile.length - 1;

        if (controllerDirectory) {
            if (splittedFile.indexOf(controllerDirectory) === -1) {
                return null;
            }

            while (splittedFile[i] !== controllerDirectory) {
                modulePath = splittedFile[i] + '/' + modulePath;
                i--;
            }
        }

        return modulePath + moduleName + '/' + controllerName;
    }

    /**
     * Indexes all controller files and their actions into the controllers list
     * @returns {{}}
     */
    function initAppControllers() {
        var grunt = require('grunt');

        // modules
        var patternControllers = baboon.config.path.modules + CONTROLLER_FILES,
            controllers = grunt.file.expand(patternControllers),
            result = {};

        lxHelpers.forEach(controllers, function (controllerFile) {
            // get controller path, e.g. app/blog/blog
            var controllerPath = getControllerPath(controllerFile, '/', 'modules');

            if (controllerPath) {
                // init controller and store in result
                result[PATH_API + controllerPath] = require(controllerFile)(baboon);
            }
        });

        // lib
        patternControllers = baboon.config.path.lib_controller + '/*.js';
        controllers = grunt.file.expand(patternControllers);

        lxHelpers.forEach(controllers, function (controllerFile) {
            // get controller path, e.g. app/blog/blog
            var controllerPath = getControllerPath(controllerFile, '/', null);

            if (controllerPath) {
                // init controller and store in result
                result[PATH_API + controllerPath] = require(controllerFile)(baboon);
            }
        });

        return result;
    }

    var controllers = initAppControllers();

    /**
     *
     * @param route
     * @returns {{action: *, controllerName: *, controllerFullPath: string}}
     */
    function parseRoute(route) {
        var parts = route.split('/');

        return {
            action: parts.pop(),
            controllerName: parts[parts.length - 1],
            controllerFullPath: parts.join('/')
        };
    }

    /**
     * Returns controllers with their actions
     *
     * @returns {*}
     */
    pub.getControllers = function () {
        return controllers;
    };

    /**
     * Adds a controller or controller file to the controllers list
     *
     * @param controller
     * @param controllerPath
     * @param args
     */
    pub.addController = function (controller, controllerPath, args) {
        controllerPath = PATH_API + controllerPath;

        if (controllerPath[controllerPath.length - 1] === '/') {
            controllerPath = controllerPath.slice(0, -1);
        }

        if (!lxHelpers.isObject(controller)) {
            if (fs.existsSync(controller)) {
                // init controller
                controller = require(controller)(args);
            } else {
                return;
            }
        }

        // init
        controllers[controllerPath] = {};

        lxHelpers.forEach(controller, function (action, functionName) {
            var params = getParamNames(action);

            // check signature of params of function
            if (params.length === 3 && params[0] === 'data' && params[1] === 'request' && params[2] === 'callback') {
                // store in list
                controllers[controllerPath][functionName] = action;
            }
        });

        // remove when no action available
        if (Object.keys(controllers[controllerPath]).length === 0) {
            delete controllers[controllerPath];
        }
    };

    /**
     * Processes the rest request and calls the controller/action
     * @param req
     * @param res
     */
    pub.processRequest = function (req, res) {
        // remove trailing slash
        var route = req.originalUrl.substring(1);
        var parsedRoute = parseRoute(route);
        var data = req.body;
        var request = {
            getSession: function (callback) {
                if (callback) {
                    callback(null, req.session);
                }
            },
            setSession: function (session, callback) {
                if (callback) {
                    callback(null, true);
                }
            }
        };

        if (controllers[parsedRoute.controllerFullPath] && controllers[parsedRoute.controllerFullPath][parsedRoute.action]) {
            controllers[parsedRoute.controllerFullPath][parsedRoute.action](data, request, function (error, result) {
                if (error) {
                    res.json(401, error);
                } else {
                    res.json(200, result);
                }
            });
        }
        else {
            res.json(403, 'Wrong url');
        }
    };

    /**
     * Registers the events on the socket
     *
     * @param socket
     */
    pub.registerSocketEvents = function (socket) {
        // iterate over each controller in the acl module
        lxHelpers.forEach(controllers, function (actions, controllerName) {

            // iterate over each action in the controller
            lxHelpers.forEach(actions, function (action, actionName) {
                var eventName = controllerName + '/' + actionName;

                // register socket event
                socket.on(eventName, function (data, callback) {
                    controllers[controllerName][actionName](data, {}, function (error, result) {
                        callback(error, result);
                    });
                });
            });
        });
    };

    return pub;
};