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
            { name: 'session', resources:['getUsername', 'setActivity', 'isAuthenticated'] }
        ]
    };

    /**
     * start websocket
     */
    app.server.sio.sockets.on('connection', function (socket) {
        var tmp;

        // session
        var session = socket.handshake.session;
        //noinspection JSUndefinedPropertyAssignment
        app.session = session;

        //noinspection JSUnresolvedVariable
        app.logging.syslog.info('client connected');
        app.logging.syslog.debug('{socketId: ' + socket.id + ', username: ' + session.user.name + ', ' +
            'sessionID: ' + session.sessionID + '}');

        socket.on('disconnect', function () {
            app.logging.syslog.info('socket: ' + socket.id + ' disconnected');
        });

        /**
         * include modules and register resources
         */
        lxHelpers.arrayForEach(acl.modules, function (mod) {
//            tmp = require('./app/' + mod.name)(socket, mod, app);
//            tmp = require('./app/' + mod.name)(app);
            tmp = require(app.config.path.controllers + '/' + mod.name)(app);

            // register resources
            base.register(mod.name, socket, mod, tmp);
        });
    });
};
