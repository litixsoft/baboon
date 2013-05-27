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
            { name: 'session', resources:['getAll', 'setActivity', 'setData', 'getData'] }
        ]
    };

    /**
     * start websocket
     */
    app.server.sio.sockets.on('connection', function (socket) {
        var tmp,
            config = app.config,
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

        socket.on('session_activity', function(callback) {
            // is an active session
            if (session.user && session.activity) {
                // check inactive time
                var start = new Date(session.activity);
                var end = new Date();
                var difference = (end - start) / 1000;
                //noinspection JSUnresolvedVariable
                if (config.sessionInactiveTime < difference) {
                    // to long inactive reload site
                    socket.emit('site_reload');

                } else {
                    // session ok set new activity
                    session.activity = new Date();
                }
            } else {
                // session not exists
                callback('session not exists');
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
