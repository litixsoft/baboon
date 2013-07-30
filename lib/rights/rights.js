'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers');

module.exports = function (app, rightsRepo) {
    var pub = {};
//        repo = require(app.config.path.repositories).blog(app.config.mongo.blog),
//        syslog = app.logging.syslog;
//        audit = app.logging.audit;

    var getUserRights = function (user, groups) {
        var tmp = {},
            result = [];

        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        // set group rights
        if (lxHelpers.isArray(groups) && !lxHelpers.isEmpty(user.groups)) {
            lxHelpers.forEach(user.groups, function (groupId) {
                var group = lxHelpers.arrayFirst(groups, function (item) {
                    return item._id.toString() === groupId.toString();
                });

                if (lxHelpers.isObject(group)) {
                    lxHelpers.forEach(group.rights, function (right) {
                        tmp[right.toString()] = {_id: right, hasAccess: true};
                    });
                }
            });
        }

        lxHelpers.forEach(user.rights || [], function (right) {
            if (typeof right.hasAccess === 'boolean') {
                tmp[right._id.toString()] = {_id: right._id, hasAccess: right.hasAccess};
            }
        });

        lxHelpers.forEach(tmp, function (id, right) {
            if (typeof right.hasAccess === 'boolean') {
                result.push(right);
            }
        });

        return result;
    };

    var getUserAcl = function (user, allRights, groups) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        if (!allRights || (lxHelpers.isEmpty(user.rights) && lxHelpers.isEmpty(user.groups))) {
            return [];
        }

        var result = {},
            userRights = getUserRights(user, groups);

        if (lxHelpers.isEmpty(userRights)) {
            return result;
        }

        lxHelpers.forEach(userRights, function (userRight) {
            var right = lxHelpers.arrayFirst(allRights, function (item) {
                return item._id.toString() === userRight._id.toString();
            });

            if (lxHelpers.isObject(right) && userRight.hasAccess) {
                result[right.name] = true;
            }
        });

        return result;
    };

    var userHasAccess = function (user, right) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        // check by acl
        if (user.acl && typeof right === 'string') {
//        return lxHelpers.arrayIndexOf(user.acl, right) > -1;
            return !!user.acl[right];
        }

        return false;
    };

    pub.getUserForLogin = function (name, callback) {
        rightsRepo.users.getOne({name: name}, {fields: ['name', 'hash', 'salt']}, function (error, result) {
            if (error) {
                console.error('%s! getting user from db: %j', error, name);
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
                rightsRepo.groups.getAll({_id: {$in: results.getUser.groups}}, callback);
            }],
            getUserAcl: ['getAllRights', 'getUserGroups', function (callback, results) {
                var user = results.getUser;

                user.acl = getUserAcl(user, results.getAllRights, results.getUserGroups);
                user.hasAccessTo = userHasAccess;

                callback(null, user);
            }]
        }, function (error, results) {
            if (error) {
                console.error('%s! getting user from db: %j', error, id);
                return;
            }

            callback(null, results.getUserAcl);
        });
    };

    return pub;
};
