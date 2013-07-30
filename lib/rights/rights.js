'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers');

module.exports = function (app, rightsRepo) {
    var pub = {},
//        repo = require(app.config.path.repositories).blog(app.config.mongo.blog),
        syslog = app.logging.syslog;
//        audit = app.logging.audit;

    var getUserAcl = function (user, allRights, groups) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        if (!allRights || lxHelpers.isEmpty(user.rights)) {
            return [];
        }

        var result = {},
            userRights = pub.getUserRights(user, groups);

        if (lxHelpers.isEmpty(userRights)) {
            return result;
        }

        lxHelpers.forEach(userRights, function (userRight) {
            var right = lxHelpers.arrayFirst(allRights, function (item) {
                return item.id.toString() === userRight.id.toString();
            });

            if (lxHelpers.isObject(right) && userRight.hasAccess) {
                result[right.name] = true;
            }
        });

        return result;
    };

    pub.getUserForLogin = function (name, callback) {
        rightsRepo.users.getOne({username: name}, {fields: ['username', 'hash', 'salt']}, function (error, result) {
            if (error) {
                syslog.error('%s! getting user from db: %j', error, name);
                callback(error, null);
                return;
            }

            callback(null, result);
        });
    };

    pub.getUser = function (id, callback) {
        async.auto({
            getUser: function (callback) {
                rightsRepo.users.getOneById(id, callback);
            },
            getAllRights: function (callback) {
                rightsRepo.rights.getAll(callback);
            },
            getUserGroups: ['getUser', function (callback, results) {
                rightsRepo.groups.getAll({_id: {$in: results.groups}}, callback);
            }],
            getUserAcl: ['getAllRights', 'getUserGroups', function (callback, results) {

            }]
        }, function (error) {
            if (error) {
                syslog.error('%s! getting user from db: %j', error, id);
            }
        });
    };

    return pub;
};
