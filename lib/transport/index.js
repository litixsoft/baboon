'use strict';

var lxHelpers = require('lx-helpers'),
    TransportError = require('../errors').TransportError,
    path = require('path'),
    fs = require('fs');

module.exports = function (baboon) {
    if(!baboon || !baboon.config){
        throw new TransportError(400, '', 'Parameter baboon is required!');
    }

    var pub = {},
        PATH_API = 'api/',
        CONTROLLER_FILES = '/**/controllers/*.js',
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var useRightSystem = baboon.config.useRightSystem || false;

    function userHasAccessTo(route) {
        var rights = {
            'api/employees/employees/getAll': true,
            'api/employees/employees/getAll2': true,
            'api/employees/employees/getById': false,
//            'api/employees/employees/getError': true,
            'api/navigation/getTree': true,
            'api/navigation/getList': true,
            'api/rights/getRights': false
        };

        return rights[route];
    }

    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)  || [];
    }

    function getControllerPath(fullPathToControllerFile, separator, controllerDirectory) {
        var modulePath = '';
        var splittedFile = fullPathToControllerFile.split(separator || path.sep);
        var controllerName = splittedFile.pop();

        if (controllerName.indexOf('.js') > 0) {
            controllerName = controllerName.replace('.js', '');
            splittedFile.pop();
        }

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

    function initAppControllers() {
        var grunt = require('grunt'),
            patternControllers = baboon.config.path.modules + CONTROLLER_FILES,
            controllers = grunt.file.expand(patternControllers),
            result = {};

        lxHelpers.forEach(controllers, function (controllerFile) {
            if (fs.existsSync(controllerFile)) {
                // get controller path, e.g. app/blog/blog
                var controllerPath = getControllerPath(controllerFile, '/', 'modules');

                if (controllerPath) {
                    // init controller and store in result
                    result[PATH_API + controllerPath] = require(controllerFile)(baboon);
                }
            }
        });

        return result;
    }

    var controllers = initAppControllers();

    function parseRoute(route) {
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
    }

    pub.getControllers = function () {
        return controllers;
    };

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

        controllers[controllerPath] = {};

        lxHelpers.forEach(controller, function (action, functionName) {
            var params = getParamNames(action);

            if (params.length === 3 && params[0] === 'data' && params[1] === 'request', params[2] === 'callback') {
                // store in list
                controllers[controllerPath][functionName] = action;
            }
        });
    };

    // rest request
    pub.processRequest = function (req, res) {
        // remove trailing slash
        var route = req.originalUrl.substring(1);
        var parsedRoute = parseRoute(route);

        if ((!useRightSystem) || ( useRightSystem && userHasAccessTo(route))) {
            var data = req.body;

//            var signedCookies = require('express/node_modules/cookie').parse(req.headers.cookie),
//                sessionId = require('express/node_modules/connect/lib/utils')
//                    .parseSignedCookies(signedCookies, app.config.sessionSecret)[app.config.sessionKey];
//
//            app.sessionStore.get(sessionId, function(err, session){
//                console.log(session);
//
//                var a = session[a]++;
//                session[a] = a;
//
//                app.sessionStore.set(sessionId, session, function(err, session){
//                });
//            });

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
//                        next(error);
                    } else {
                        res.json(200, result);
                    }
//                    res.send({error: error, data: result});
                });
            } else {
                res.json(403, 'Wrong url');
            }
        } else {
            res.json(403, 'Access denied.');
        }
    };

    pub.registerSocketEvents = function (socket) {
        // iterate over each controller in the acl module
        lxHelpers.forEach(controllers, function (actions, controllerName) {

            // iterate over each action in the controller
            lxHelpers.forEach(actions, function (action, actionName) {
                var eventName = controllerName + '/' + actionName;

                if ((!baboon.useRightSystem) || ( baboon.useRightSystem && userHasAccessTo(eventName))) {
                    // register socket event
                    socket.on(eventName, function (data, callback) {
//                    console.log('########## socket: received event from client: %s', eventName);

                        controllers[controllerName][actionName](data, {}, function (error, result) {
                            callback(error, result);
                        });
                    });

//                    console.log('########## socket: registered event %s', eventName);
                }

            });
        });
    };

    return pub;
};
