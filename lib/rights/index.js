'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers');

module.exports.getUserRights = function (user, groups) {
    var tmp = {},
        result = [];

    // check params
    if (!lxHelpers.isObject(user)) {
        throw lxHelpers.getTypeError('user', user, {});
    }

    // add user group rights
    if (lxHelpers.isArray(groups) && !lxHelpers.isEmpty(user.groups)) {
        lxHelpers.forEach(user.groups, function (groupId) {
            // get group
            var group = lxHelpers.arrayFirst(groups, function (item) {
                return item._id.toString() === groupId.toString();
            });

            if (lxHelpers.isObject(group)) {
                lxHelpers.forEach(group.rights, function (right) {
                    // add group rights
                    tmp[right.toString()] = {_id: right, hasAccess: true};
                });
            }
        });
    }

    // add user rights
    lxHelpers.forEach(user.rights || [], function (right) {
        if (typeof right.hasAccess === 'boolean') {
            // set or override right
            tmp[right._id.toString()] = {_id: right._id, hasAccess: right.hasAccess};
        }
    });

    // merge rights to result
    lxHelpers.forEach(tmp, function (id, right) {
        if (typeof right.hasAccess === 'boolean') {
            result.push(right);
        }
    });

    return result;
};

module.exports.getUserAcl = function (user, allRights, groups) {
    // check params
    if (!lxHelpers.isObject(user)) {
        throw lxHelpers.getTypeError('user', user, {});
    }

    var result = {};

    // sysadmin has access to all rights
    if (user.id === 1) {
        lxHelpers.forEach(allRights, function (right) {
            result[right.name] = true;
        });

        return result;
    }

    if (!allRights || (lxHelpers.isEmpty(user.rights) && lxHelpers.isEmpty(user.groups))) {
        return result;
    }

    var userRights = module.exports.getUserRights(user, groups);

    if (lxHelpers.isEmpty(userRights)) {
        return result;
    }

    lxHelpers.forEach(userRights, function (userRight) {
        // get right
        var right = lxHelpers.arrayFirst(allRights, function (item) {
            return item._id.toString() === userRight._id.toString();
        });

        // add right name to result if the user has access
        if (lxHelpers.isObject(right) && userRight.hasAccess) {
            result[right.name] = true;
        }
    });

    return result;
};

module.exports.userHasAccessTo = function (user, right) {
    // check params
    if (!lxHelpers.isObject(user)) {
        throw lxHelpers.getTypeError('user', user, {});
    }

    // check by acl
    if (user.acl && typeof right === 'string') {
        return !!user.acl[right];
    }

    return false;
};

/**
 * Gets the user acl as obj.
 * The original acl schema:
 * {
 *     '[module...]/controller/action': true,
 *     '[module...]/controller/action': true
 * }
 *
 * Transformed to:
 *
 * {
 *     'module': {
 *         controller: [actions...],
  *    }
 *     'module': {
 *         controller: [actions...],
  *    }
 * }
 *
 *
 * @param {Object} acl The user acl.
 * @returns {{}}
 */
module.exports.getAclObj = function (acl) {
    var result = {};

    lxHelpers.forEach(acl, function (right) {
        var parts = right.split('/'),
            action = parts.pop(),
            controller = parts.pop(),
            modulePath = parts.join('/');

        result[modulePath] = result[modulePath] || {};
        result[modulePath][controller] = result[modulePath][controller] || [];
        result[modulePath][controller].push(action);
    });

    return result;
};

module.exports.data = function (app) {
    var pub = {},
        rightsRepo = require('./repositories')(app.config.mongo.rights);

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
                rightsRepo.groups.getAll({_id: {$in: results.getUser.groups || []}}, callback);
            }],
            getUserAcl: ['getAllRights', 'getUserGroups', function (callback, results) {
                var user = results.getUser;

                user.acl = module.exports.getUserAcl(user, results.getAllRights, results.getUserGroups);

                callback(null, user);
            }]
        }, function (error, results) {
            if (error) {
                console.error('%s! getting user from db: %j', error, id);
                callback('Error loading user from db!');
                return;
            }

            callback(null, results.getUserAcl);
        });
    };

    return pub;
};

module.exports.getRepositories = function (app) {
    return require('./repositories')(app.config.mongo.rights);
};

module.exports.refreshRights = function (app) {
    var modulePath = 'modules';
    var grunt = require('grunt');
    var fs = require('fs');

    var pattern = app.config.path.modules + '/**/controllers/*.js';
    var controllers = grunt.file.expand(pattern);
    var res = [];

    lxHelpers.forEach(controllers, function (controllerFile) {
        if (fs.existsSync(controllerFile)) {
            var file = grunt.file.read(controllerFile);
            var splittedFile = controllerFile.split('/');
            var contollerName = splittedFile.pop().replace('.js', '');
            splittedFile.pop();
            var moduleName = splittedFile.pop();
//            console.log(contollerName);

            var ss = file.split('pub.');

//            console.log(ss);
            ss.shift();

            lxHelpers.forEach(ss, function (pub) {
                var ii = pub.split('=');
                res.push(modulePath + '/' + moduleName + '/' + contollerName + '/' + ii[0].trim());
            });

//            var ctrl = require(controllerFile)(app);
//            lxHelpers.forEach(ctrl, function(key) {
//                res.push(modulePath + '/' + moduleName + '/' + contollerName + '/' + key);
//            });
        }
    });

    console.log(res);
};