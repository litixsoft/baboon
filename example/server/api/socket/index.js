'use strict';

var base = require('./base.js'),
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
//    var acl = {
//        modules: [
//            { name: 'blog', resources: ['getAllPosts', 'getAllPostsWithCount', 'getPostById', 'createPost', 'updatePost', 'addComment', 'searchPosts', 'getAllTags', 'createTag', 'deleteTag'] },
//            { name: 'enterprise', resources: ['getAll', 'getById', 'updateById', 'create'] },
//            { name: 'session', resources: ['getAll', 'setActivity', 'setData', 'getData'] }
//        ]
//    };

    function getACL (userName) {
        if (userName === 'admin') {
//            return [
//                'blog.blog.getAllPosts',
//                'blog.blog.getAllPostsWithCount',
//                'blog.blog.getPostById',
//                'blog.blog.createPost',
//                'blog.blog.updatePost',
//                'blog.blog.addComment',
//                'blog.blog.searchPosts',
//                'blog.blog.getAllTags',
//                'blog.blog.createTag',
//                'blog.blog.deleteTag',
//                'enterprise.enterprise.getAll',
//                'enterprise.enterprise.getById',
//                'enterprise.enterprise.updateById',
//                'enterprise.enterprise.create',
//                'session.session.getAll',
//                'session.session.setActivity',
//                'session.session.setData',
//                'session.session.getData'
//            ];
            return {
                modules: {
                    session: {
                        controllers: {
                            session: ['getAll', 'setActivity', 'setData', 'getData']
                        }
                    },
                    blog: {
                        controllers: {
                            blog: ['getAllPosts', 'getAllPostsWithCount', 'getPostById', 'createPost', 'updatePost', 'addComment', 'searchPosts', 'getAllTags', 'createTag', 'deleteTag']
                        }
                    },
                    enterprise: {
                        controllers: {
                            enterprise: ['getAll', 'getById', 'updateById', 'create']
                        }
                    }
                }
            };
        }

        if (userName === 'andreas') {
//            return [
//                'enterprise.enterprise.getAll',
//                'enterprise.enterprise.getById',
//                'enterprise.enterprise.updateById',
//                'enterprise.enterprise.create',
//                'session.session.getAll',
//                'session.session.setActivity',
//                'session.session.setData',
//                'session.session.getData'
//            ];
            return {
                modules: {
                    session: {
                        controllers: {
                            session: ['getAll', 'setActivity', 'setData', 'getData']
                        }
                    },
                    enterprise: {
                        controllers: {
                            enterprise: ['getAll', 'getById', 'updateById', 'create']
                        }
                    }
                }
            };
        }

        // guest
//        return [
//            'session.session.getAll',
//            'session.session.setActivity',
//            'session.session.setData',
//            'session.session.getData'
//        ];
        return {
            modules: {
                session: {
                    controllers: {
                        session: ['getAll', 'setActivity', 'setData', 'getData']
                    }
                }
            }
        };
    }

    function registerACL (acl, socket, session, modulePath) {
        var tmp;
        modulePath = modulePath || '';

        lxHelpers.objectForEach(acl.modules, function (moduleName, moduleRights) {
            // load module
            tmp = require(app.config.path.modules)[moduleName];
            var tmpModulePath = modulePath + moduleName + '.';

            lxHelpers.objectForEach(moduleRights.controllers, function (controllerName, controllerRights) {
                var ctrl = tmp.controllers[controllerName](app, session);



                base.register2(socket, tmpModulePath + controllerName, ctrl, controllerRights);
            });

            if (moduleRights.modules) {
                registerACL(moduleRights, socket, session, modulePath);
            }
        });
    }

    /**
     * start websocket
     */
    app.server.sio.sockets.on('connection', function (socket) {
        var config = app.config,
            session = socket.handshake.session;

        // save socketId in session
        session.socketID = socket.id;

        //noinspection JSUnresolvedVariable
        app.logging.syslog.info('client connected');
        app.logging.syslog.debug('{socketId: ' + socket.id + ', username: ' + session.user.name + ', ' +
            'sessionID: ' + session.sessionID + '}');

        socket.on('disconnect', function () {
            app.logging.syslog.info('socket: ' + socket.id + ' disconnected');
        });

        socket.on('session_activity', function () {
            // is an active session
            if (session.user && session.activity) {
                // check max time
                var actual = new Date();
                var sessionStart = new Date(session.start);
                var sessionActivity = new Date(session.activity);
                var maxDifference = (actual - sessionStart) / 1000;
                var activityDifference = (actual - sessionActivity) / 1000;

                //noinspection JSUnresolvedVariable
                if (config.sessionMaxLife < maxDifference) {
                    return socket.emit('site_reload');
                }

                //noinspection JSUnresolvedVariable
                if (config.sessionInactiveTime < activityDifference) {
                    return socket.emit('site_reload');
                }

                return true;

            } else {
                // session not exists
                return socket.emit('site_reload');
            }
        });

        var acl = getACL(session.user.name);

        registerACL(acl, socket, session);

        /**
         * include modules and register resources
         */
//        lxHelpers.objectForEach(acl.modules, function (key, value) {
//
//        });
//
//        lxHelpers.arrayForEach(acl.modules, function (mod) {
//            tmp = require(app.config.path.controllers + '/' + mod.name)(app, session);
//
//            // register resources
//            base.register(mod.name, socket, mod, tmp);
//        });
//
////        /**
//         * include modules and register resources
//         */
//        lxHelpers.arrayForEach(acl.modules, function (mod) {
//            tmp = require(app.config.path.controllers + '/' + mod.name)(app, session);
//
//            // register resources
//            base.register(mod.name, socket, mod, tmp);
//        });
    });
}
;
