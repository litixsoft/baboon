'use strict';

/**
 * The blog api.
 *
 * @param {!object} socket The WebSocket.
 * @param {!object} acl The acl.
 * @param {!string} acl.name The name of the module.
 * @param {!object} app The baboon app.
 * @param {!object} app.config The baboon app config.
 * @param {!object} app.logging.syslog The baboon app syslog.
 * @param {!object} app.logging.audit The baboon app audit log.
 */
module.exports = function (socket, acl, app) {
    var pub = {},
        repo = require(app.config.path.repositories).blog(app.config.mongo.blog),
        syslog = app.logging.syslog,
        audit = app.logging.audit,
        base = require('../base');

    pub.getAllPosts = function (data, callback) {
        repo.posts.getAll(data, function (error, result) {
            callback(result);
        });
    };

    pub.getPostById = function (data, callback) {
        repo.posts.getById(data, function (error, result) {
            callback(result);
        });
    };

    pub.createPost = function (data, callback) {
        data = data || {};

        syslog.debug('Validate new blog post: %j', data);

        repo.posts.validate(data, {}, function (error, result) {
            if (error) {
                syslog.error('%s! validating blog post: %j', error, data);
                callback({success: false, message: 'Could not create blog post!'});
                return;
            }

            if (result.valid) {
                data.created = new Date();

                repo.posts.create(data, function (error, result) {
                    if (error) {
                        syslog.error('%s! creating blog post in db: %j', error, data);
                        callback({success: false, message: 'Could not create blog post!'});
                        return;
                    }

                    if (result) {
                        audit.info('Created blog post in db: %j', data);
                        callback({success: true, data: result[0]});
                    }
                });
            } else {
                callback({success: false, errors: result.errors});
            }
        });
    };

    // register resultources
    base.register(acl.name, socket, acl, pub);
};