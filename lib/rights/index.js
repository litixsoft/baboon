'use strict';

var async = require('async'),
    pwd = require('pwd'),
    lxHelpers = require('lx-helpers');

module.exports = function (config, logging) {
    var pub = {};

    function createHash (user, callback) {
        if (user.password) {
            pwd.hash(user.password, function (error, salt, hash) {
                if (error) {
                    callback(error);
                }

                user.salt = salt;
                user.hash = hash;
                delete user.password;

                callback(null, user);
            });
        } else {
            callback(null, user);
        }
    }

    pub.getUserRights = function (user, allGroupsOfUser, additionalGroups) {
        var tmp = {},
            result = [];

        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        // add user group rights
        if (lxHelpers.isArray(allGroupsOfUser) && !lxHelpers.isEmpty(user.groups)) {
            lxHelpers.forEach(user.groups, function (groupId) {
                // get group
                var group = lxHelpers.arrayFirst(allGroupsOfUser, function (item) {
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

        // add additional group rights
        if (lxHelpers.isArray(additionalGroups)) {
            lxHelpers.forEach(additionalGroups, function (group) {
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

    pub.getUserAcl = function (user, allRights, groups, additionalGroups) {
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

        var userRights = pub.getUserRights(user, groups, additionalGroups);

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
        var res = {},
            rightsRepo = require('./repositories')(config.mongo.rights);

        res.getUserForLogin = function (name, callback) {
            rightsRepo.users.getOne({name: name}, {fields: ['name', 'hash', 'salt']}, function (error, result) {
                if (error) {
                    logging.syslog.error('%s! getting user from db: %j', error, name);
                    callback(error, null);
                    return;
                }

                callback(null, result);
            });
        };

        res.getUser = function (id, callback) {
            async.auto({
                getUser: function (next) {
                    if (typeof id === 'number') {
                        rightsRepo.users.getOne({id: id}, next);
                    } else {
                        rightsRepo.users.getOneById(id, next);
                    }
                },
                getAllRights: function (next) {
                    rightsRepo.rights.getAll(next);
                },
                getUserGroups: ['getUser', function (next, results) {
                    if (!results.getUser || lxHelpers.isEmpty(results.getUser.groups)) {
                        next(null, []);
                    } else {
                        rightsRepo.groups.getAll({_id: {$in: results.getUser.groups}}, next);
                    }
                }],
                getUserAcl: ['getAllRights', 'getUserGroups', function (next, results) {
                    var user = results.getUser;

                    if (!user) {
                        next(null, {});
                        return;
                    }

                    user.acl = pub.getUserAcl(user, results.getAllRights, results.getUserGroups);

                    // delete protected properties
                    delete user.hash;
                    delete user.salt;

                    next(null, user);
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

        return res;
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

    pub.refreshRightsIdDb = function (callback) {
        var repo = pub.getRepositories().rights,
            acl = pub.getPublicFunctionsFromControllers(),
            aclKeys = Object.keys(acl);

        async.each(aclKeys, function (rightName, next) {
            repo.getOne({name: acl[rightName]}, function (error, result) {
                if (error) {
                    next(error);
                    return;
                }

                if (!result) {
                    repo.create({name: acl[rightName]}, function (error, result) {
                        if (result) {
                            logging.syslog.info('rights: Created right ' + acl[rightName]);
                        }

                        next(error);
                    });
                } else {
                    next();
                }
            });
        }, function (error) {
            callback(error);
        });
    };

    pub.ensureThatDefaultSystemUsersExists = function (callback) {
        var repo = pub.getRepositories().users,
            systemUsers = [
                {id: -1, name: 'guest', locked: true},
                {id: 1, name: 'sysadmin', locked: true, password: 'a'}
            ];

        async.each(systemUsers, function (user, next) {
            repo.getOne({id: user.id, locked: true}, function (error, result) {
                if (error) {
                    next(error);
                    return;
                }

                if (result) {
                    next();
                } else {
                    createHash(user, function (error, userWithPasswordHash) {
                        if (error) {
                            next(error);
                            return;
                        }

                        if (userWithPasswordHash) {
                            repo.create(userWithPasswordHash, function (error, result) {
                                if (error) {
                                    next(error);
                                    return;
                                }

                                if (result) {
                                    logging.syslog.info('rights: Created new user in db: %j', user);
                                    next();
                                }
                            });
                        }
                    });
                }
            });
        }, function (error) {
            callback(error);
        });
    };

    return pub;
};