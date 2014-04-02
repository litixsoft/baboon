'use strict';

var lxHelpers = require('lx-helpers'),
    TransportError = require('./errors').TransportError,
    Session = require('express').session,
    fs = require('fs');

module.exports = function (baboon) {
    if (!baboon || !baboon.config) {
        throw new TransportError(400, '', 'Parameter baboon with baboon.config is required!');
    }

    var pub = {},
        PATH_API = 'api/',
        CONTROLLER_FILES = '/**/controllers/*.js',
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var useRightSystem = (baboon.config.rights || {}).enabled || false;

    function checkUserHasAccessTo(user, acl, route) {
        if (route.indexOf(PATH_API) === 0) {
            route = route.slice(PATH_API.length);
        }

        // right system is disabled or system routes
        if ((!useRightSystem) || (route.indexOf('navigation') === 0) || (route.indexOf('session') === 0)) {
            return true;
        }

        if (user) {
            // check user has access to
            return baboon.rights.userHasAccessTo(user, route);
        }

        if (acl) {
            // check if route is in acl
            return ((acl[route] || {}).hasAccess || false);
        }

        // no user or acl
        return false;
    }

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

        if (splittedFile.indexOf(controllerDirectory) === -1) {
            // no modulename found, therefore modulename = controllerDirectory and
            // controllerDirectory not anymore in splittedFile
            return null;
        }

        while (splittedFile[i] !== controllerDirectory) {
            modulePath = splittedFile[i] + '/' + modulePath;
            i--;
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

        if (checkUserHasAccessTo(req.session.user, null, route)) {
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
                },
                headers: req.headers
            };

            if (controllers[parsedRoute.controllerFullPath] && controllers[parsedRoute.controllerFullPath][parsedRoute.action]) {
                controllers[parsedRoute.controllerFullPath][parsedRoute.action](data, request, function (error, result) {
                    if (error) {
                        res.json(400, error);
                    } else {
                        res.json(200, result);
                    }
                });
            }
            else {
                res.json(403, 'Wrong url');
            }
        } else {
            res.json(403, 'Access denied.');
        }
    };

    /**
     * Registers the events on the socket
     *
     * @param socket
     */
    pub.registerSocketEvents = function (socket) {
        var headers = socket.handshake.headers;
        var cookie = headers.cookie;

        var request = {
            getSession: function (callback) {
                baboon.session.getSession(cookie, function(err, session){
                    callback(err, new Session(session));
                });
            },
            setSession: function (session, callback) {
                baboon.session.setSession(session, callback);
            },
            headers: headers
        };

        var registerEvents = function (acl) {
            // iterate over each controller in the acl module
            lxHelpers.forEach(controllers, function (actions, controllerName) {

                // iterate over each action in the controller
                lxHelpers.forEach(actions, function (action, actionName) {
                    var eventName = controllerName + '/' + actionName;

                    if (checkUserHasAccessTo(null, acl, eventName)) {

                        // register socket event
                        socket.on(eventName, function (data, callback) {
                            controllers[controllerName][actionName](data, request, function (error, result) {
                                callback(error, result);
                            });
                        });
                    }
                });
            });
        };

        if (useRightSystem) {
            // register socket events based on user acl
            baboon.session.getSession(cookie, function (error, session) {
                registerEvents((session.user || {}).acl);
            });
        } else {
            registerEvents();
        }
    };

    return pub;
};