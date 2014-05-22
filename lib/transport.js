'use strict';

var lxHelpers = require('lx-helpers'),
    TransportError = require('./errors').TransportError,
    fs = require('fs');

/**
 * The transport module.
 *
 * @param {!Object} baboon The baboon object.
 * @return {Object} An object with methods for tranpsorting data.
 */
module.exports = function (baboon) {
    if (!baboon || !baboon.config) {
        throw new TransportError(400, '', 'Parameter baboon with baboon.config is required!');
    }

    var pub = {},
        PATH_API = 'api/',
        CONTROLLER_FILES = '/**/controllers/*.js',
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var useRightSystem = (baboon.config.rights || {}).enabled || false;

    /**
     * Checks weather the user has access to a route or not
     *
     * @param {?Object} user The user object
     * @param {?Object} acl The users acl
     * @param {!String} route The route to check access to
     * @return {Object}
     */
    function checkUserHasAccessTo(user, acl, route) {
        // delete PATH_API from route
        route = route.slice(PATH_API.length);

        // right system is disabled or system routes
        if ((!useRightSystem) || (route.indexOf('navigation') === 0) || (route.indexOf('session') === 0) || (route.indexOf('settings') === 0) || (route.indexOf('account') === 0) || (route.indexOf('auth') === 0)) {
            return true;
        }

        if (user) {
            // check in rights if user has access to
            return baboon.rights.userHasAccessTo(user, route);
        }

        if (acl) {
            // check if route is in users acl
            return ((acl[route] || {}).hasAccess || false);
        }

        // no user or acl
        return false;
    }

    /**
     * Returns the function parameters as strings in an array
     *
     * @param func
     * @return {Array|{index: number, input: string}|Array}
     */
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g) || [];
    }

    /**
     * Return the controller path for the route
     *
     * @param {String} fullPathToControllerFile
     * @param {String} separator
     * @param {String} controllerDirectory
     * @return {Object}
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
     *
     * @return {Object}
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
     * Parses the route and returns action, controller, path
     *
     * @param {String} route
     * @return {{action: *, controllerName: *, controllerFullPath: string}}
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
     * @return {Object}
     */
    pub.getControllers = function () {
        return controllers;
    };

    /**
     * Adds a controller or controller file to the controllers list
     *
     * @param {String} controller The path to the controller file
     * @param {String} controllerPath The path to which the controller functions are saved in the list
     * @param {Object=} args The args to require a controller file
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
     * @param {Object} req The request object
     * @param {Object} res The response Object
     */
    pub.processRequest = function (req, res) {
        // remove trailing slash
        var route = req.originalUrl.substring(1);
        var warn;

        if (checkUserHasAccessTo(req.session.user, null, route)) {
            var parsedRoute = parseRoute(route);
            var data = req.body;
            var request = {
                sessionID: req.sessionID,
                session: req.session,
                setSession: function (callback) {
                    callback(null, true);
                },
                headers: req.headers
            };

            if (controllers[parsedRoute.controllerFullPath] && controllers[parsedRoute.controllerFullPath][parsedRoute.action]) {
                controllers[parsedRoute.controllerFullPath][parsedRoute.action](data, request, function (error, result) {
                    if (error) {

                        var status = error.status || 500;

                        if (status < 400) {
                            status = 500;
                        }

                        // log error
                        baboon.loggers.syslog.error(error.stack);

                        res.json(status, error);
                    }
                    else {
                        res.json(200, result);
                    }
                });
            }
            else {

                // warning
                warn = {
                    message: 'Wrong url',
                    status: 404,
                    route: parseRoute(route),
                    reqBody: req.body,
                    reqHeaders: req.headers
                };

                // log warning
                baboon.loggers.syslog.warn(warn);

                res.json(warn.status, warn.message);
            }
        } else {

            // warning
            warn = {
                message: 'Access denied',
                status: 403,
                route: parseRoute(route),
                reqBody: req.body,
                reqHeaders: req.headers
            };

            // log warning
            baboon.loggers.syslog.warn(warn);

            res.json(warn.status, warn.message);
        }
    };

    /**
     * Registers the events on the socket
     *
     * @param {Object} socket
     */
    pub.registerSocketEvents = function (socket) {

        var req = socket.handshake;

        //var headers = socket.handshake.headers;
        //var cookie = headers.cookie;

        var request = {
            sessionID: req.sessionID,
            session: req.session,
            setSession: function (callback) {
                baboon.session.setSession(req.session, callback);
            },
            headers: req.headers
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
                            controllers[controllerName][actionName](data, request, callback);
                        });
                    }
                });
            });
        };

        if (useRightSystem) {
            // register socket events based on users acl
            registerEvents((req.session.user || {}).acl);
        } else {
            registerEvents();
        }
    };

    return pub;
};