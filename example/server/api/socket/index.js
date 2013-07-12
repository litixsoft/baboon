'use strict';

var lxHelpers = require('lx-helpers');
var base = require('./base.js');

/**
 * The socket api.
 *
 * @param {!object} app The baboon object.
 * @param {!object} app.server The server object.
 * @param {!object} app.config The config object.
 * @param {!object} app.logging.syslog The syslog object.
 */
module.exports = function (app) {
    var acl = {
        modules: [
            { name: 'blog', resources: ['getAllPosts', 'getAllPostsWithCount', 'getPostById', 'createPost', 'updatePost', 'addComment', 'searchPosts', 'getAllTags', 'createTag', 'deleteTag'] },
            { name: 'enterprise', resources: ['getAll', 'getById', 'updateById', 'create'] },
            { name: 'session', resources: ['getAll', 'setActivity', 'setData', 'getData'] }
        ]
    };

    /**
     * start websocket
     */
    app.server.sio.sockets.on('connection', function (socket) {
        var tmp,
            config = app.config,
            session = socket.handshake.session;

        console.log('socket connection');
        // save socketId in session
        session.socketID = socket.id;

        //noinspection JSUnresolvedVariable
        app.logging.syslog.info('client connected');
        app.logging.syslog.debug('{socketId: ' + socket.id + ', username: ' + ((session.user || {}).name || 'no user') + ', ' +
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
            }
            else {
                // session not exists
                return socket.emit('site_reload');
            }
        });

        /**
         * include modules and register resources
         */
        lxHelpers.arrayForEach(acl.modules, function (mod) {
            tmp = require(app.config.path.controllers + '/' + mod.name)(app, session);

            // register resources
            base.register(mod.name, socket, mod, tmp);
        });
    });
};
