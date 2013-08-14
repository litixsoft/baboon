'use strict';

var async = require('async'),
    lxHelpers = require('lx-helpers');

module.exports = function (config, logging) {
    var pub = {};

    pub.getUserRights = function (user, groups) {
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

    pub.getUserAcl = function (user, allRights, groups) {
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

        var userRights = pub.getUserRights(user, groups);

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

    pub.userHasAccessTo = function (user, right) {
        if (config && config.useRightsSystem === false) {
            // return true when rights system is disabled
            return true;
        }

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

    pub.getAclObj = function (acl) {
        var result = {};

        if (config && config.useRightsSystem === false) {
            // get all rights automatically
            acl = pub.getPublicFunctionsFromControllers(config);
        }

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

    pub.secureNavigation = function (user, navigation) {
        var result = [];

        lxHelpers.forEach(navigation, function (item) {
            var navItem = lxHelpers.clone(item);

            // process child navigation items
            if (item.children) {
                navItem.children = pub.secureNavigation(user, item.children);
            }

            // check if navigation item needs a right/resource to be visible and check if the user has that right/resource
            if (!item.hasOwnProperty('resource') || pub.userHasAccessTo(user, item.resource)) {
                // delete rigth from navigation item
                if (navItem.resource) {
                    delete navItem.resource;
                }

                result.push(navItem);
            }
        });

        return result;
    };

    pub.data = function () {
        var pub = {},
            rightsRepo = require('./repositories')(config.mongo.rights);

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

                    user.acl = pub.getUserAcl(user, results.getAllRights, results.getUserGroups);

                    callback(null, user);
                }]
            }, function (error, results) {
                if (error) {
                    logging.syslog.error('%s! getting user from db: %j', error, id);
                    callback('Error loading user from db!');
                    return;
                }

                callback(null, results.getUserAcl);
            });
        };

        return pub;
    };

    pub.getRepositories = function () {
        return require('./repositories')(config.mongo.rights);
    };

    pub.getPublicFunctionsFromControllers = function () {
        var grunt = require('grunt'),
            fs = require('fs'),
            pattern = config.path.modules + '/**/controllers/*.js',
            controllers = grunt.file.expand(pattern),
            res = [];

        lxHelpers.forEach(controllers, function (controllerFile) {
            if (fs.existsSync(controllerFile)) {
                var modulePath = '';
                var file = grunt.file.read(controllerFile);
                var splittedFile = controllerFile.split('/');
                var contollerName = splittedFile.pop().replace('.js', '');
                splittedFile.pop();
                var moduleName = splittedFile.pop();
//            console.log(contollerName);

                var i = splittedFile.length - 1;
                while (splittedFile[i] !== 'modules') {
                    modulePath = splittedFile[i] + '/' + modulePath;
                    i--;
                }

                var ss = file.split('pub.');
                ss.shift();

                lxHelpers.forEach(ss, function (pub) {
                    var ii = pub.split('=');
                    res.push(modulePath + moduleName + '/' + contollerName + '/' + ii[0].trim());
                });
            }
        });

        return res;
    };

    pub.refreshRights = function () {
        var repo = pub.getRepositories().rights,
            acl = pub.getPublicFunctionsFromControllers();

        lxHelpers.forEach(acl, function (rightName) {
            repo.getOne({name: rightName}, function (error, result) {
                if (error) {
                    logging.syslog.error(error);
                } else if (!result) {
                    repo.create({name: rightName}, function (error, result) {
                        if (error) {
                            logging.syslog.error(error);
                        }

                        if (result) {
                            logging.syslog.info('rights: Created right ' + rightName);
                        }
                    });
                }
            });
        });
    };

    return pub;
};