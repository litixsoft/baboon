'use strict';

var async = require('async'),
    pwd = require('pwd'),
    os = require('os'),
    lxHelpers = require('lx-helpers');

/**
 * Returns the rights module.
 *
 * @param {!Object} config The config.
 * @param {!Object} config.mongo The mongo Object with the connection strings.
 * @param {!Object} config.path The path object with all app paths.
 * @param {Boolean=} config.useRightsSystem Indicates if the rights system is enabled.
 * @param {!Object} logging The logging object.
 * @param {!Object} logging.syslog The syslogger.
 * @returns {{}}
 */
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

    function addRoleRights (roles, allRoles, result) {
        // add user roles rights
        lxHelpers.forEach(roles, function (roleId) {
            var role = lxHelpers.arrayFirst(allRoles, function (item) {
                return item._id.toString() === roleId.toString();
            });

            if (role) {
                lxHelpers.forEach(role.rights, function (right) {
                    // add group rights
                    result[right.toString()] = {_id: right, hasAccess: true};
                });
            }
        });
    }

    function getInfoFromComment (comment, type) {
        if (!comment || !type) {
            return null;
        }

        comment = comment.substring(comment.lastIndexOf('/**'));

        var splittedComment = comment.split('@' + type);

        if (splittedComment.length === 1) {
            return null;
        }

        var result = splittedComment[1].substring(0, splittedComment[1].indexOf(os.EOL));

        return result.trim();
    }

    /**
     * Returns all the user rights.
     *
     * @param {!Object} user The user object.
     * @param {Array.<ObjectID>=} user.groups The mongo ids () of the groups of the user.
     * @param {Array.<ObjectID>=} user.roles The mongo ids of the roles of the user.
     * @param {Array.<Object>=} user.rights The rights of the user. ({_id: ObjectID, hasAccess: Boolean})
     * @param {!Array} allRoles All roles of the user.
     * @param {!Array} allGroups All groups of the user.
     * @param {Array=} additionalRoles Additional roles added at runtime.
     * @param {Array.<Object>=} resourceRights The resource rights of the user. ([{right_id: ObjectID, resource: *}])
     * @returns {[{_id: ObjectID, hasAccess: Boolean, resource: *}]}
     */
    pub.getUserRights = function (user, allRoles, allGroups, additionalRoles, resourceRights) {
        var tmp = {},
            result = [];

        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        // add user group rights
        if (lxHelpers.isArray(allGroups) && !lxHelpers.isEmpty(user.groups)) {
            lxHelpers.forEach(user.groups, function (groupId) {
                // get group
                var group = lxHelpers.arrayFirst(allGroups, function (item) {
                    return item._id.toString() === groupId.toString();
                });

                if (lxHelpers.isObject(group)) {
                    addRoleRights(group.roles, allRoles, tmp);
                }
            });
        }

        // add user roles rights
        addRoleRights(user.roles, allRoles, tmp);

        // add additional role rights
        if (lxHelpers.isArray(additionalRoles)) {
            lxHelpers.forEach(additionalRoles, function (role) {
                if (lxHelpers.isObject(role)) {
                    lxHelpers.forEach(role.rights, function (right) {
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

        // resourceRights loaded from db
        // format
        // [{right_id: id, resource: {}}]

        // add resource rights
        lxHelpers.forEach(resourceRights, function (resource) {
            tmp[resource.right_id.toString()] = {_id: resource.right_id, hasAccess: true, resource: resource.resource};
        });

        // merge rights to result
        lxHelpers.forEach(tmp, function (id, right) {
            if (typeof right.hasAccess === 'boolean') {
                result.push(right);
            }
        });

        return result;
    };

    /**
     * Returns the user rights to which the user has access.
     *
     * @param {!Object} user The user object.
     * @param {Array.<number>=} user.id The internal id of the user.
     * @param {Array.<ObjectID>=} user.groups The mongo ids () of the groups of the user.
     * @param {Array.<ObjectID>=} user.roles The mongo ids of the roles of the user.
     * @param {Array.<Object>=} user.rights The rights of the user. ({_id: ObjectID, hasAccess: Boolean})
     * @param {Array.<Object>=} allRights The mongo ids () of the groups of the user.
     * @param {!Array} allRoles All roles of the user.
     * @param {!Array} allGroups All groups of the user.
     * @param {Array=} additionalRoles Additional roles added at runtime.
     * @param {Array.<Object>=} resourceRights The resource rights of the user. ([{right_id: ObjectID, resource: *}])
     * @returns {Object.<string, Object>} (nameOfRight: {hasAccess: true, resource: *})
     */
    pub.getUserAcl = function (user, allRights, allRoles, allGroups, additionalRoles, resourceRights) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        var result = {};

        // sysadmin has access to all rights
        if (user.id === 1) {
            lxHelpers.forEach(allRights, function (right) {
                result[right.name] = {
                    hasAccess: true
                };
            });

            return result;
        }

        if (!allRights || (lxHelpers.isEmpty(user.rights) && lxHelpers.isEmpty(user.groups) && lxHelpers.isEmpty(user.roles))) {
            return result;
        }

        var userRights = pub.getUserRights(user, allRoles, allGroups, additionalRoles, resourceRights);

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
                result[right.name] = {
                    hasAccess: true
                };

                if (userRight.resource) {
                    result[right.name].resource = userRight.resource;
                }
            }
        });

        return result;
    };

    /**
     * Returns if the user has access to the right/resource.
     *
     * @param {!Object} user The user object.
     * @param {Array.<number>=} user.id The internal id of the user.
     * @param {Array.<Object>=} user.acl The acl of the user.
     * @param {!String} right The name of the right.
     * @param {*=} resource The resource.
     * @returns {boolean}
     */
    pub.userHasAccessTo = function (user, right, resource) {
        // return true when rights system is disabled
        if (config && config.useRightsSystem === false) {
            return true;
        }

        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        // always true for sysadmin
        if (user.id === 1) {
            return true;
        }

        // check by acl
        if (user.acl) {
            if (resource) {
                return user.acl[right] && user.acl[right].hasAccess && user.acl[right].resource === resource;
            }

            return user.acl[right] && user.acl[right].hasAccess;

//            if (user.acl[right] && user.acl[right].hasAccess) {
//                if (user.acl[right].resource) {
//                    return user.acl[right].resource === resource;
//                } else {
//                    return true;
//                }
//            }
        }

        return false;
    };

    /**
     * Returns the acl of the user as object.
     *
     * @param {!Object} acl The users acl object.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.getAclObj = function (acl, callback) {
        var processAcl = function (acl) {
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

        if (config && config.useRightsSystem === false) {
            // get all rights automatically
            pub.getPublicFunctionsFromControllers(function (error, result) {
                var acl = {};

                lxHelpers.forEach(result, function (right) {
                    acl[right.name] = true;
                });

                callback(error, processAcl(acl));
            });
        } else {
            callback(null, processAcl(acl));
        }
    };

    /**
     * Returns the navigation with only the links the user has access to.
     *
     * @param {!Object} user The user object.
     * @param {!Array} navigation The navigation.
     * @returns {Array}
     */
    pub.secureNavigation = function (user, navigation) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw lxHelpers.getTypeError('user', user, {});
        }

        if (!lxHelpers.isArray(navigation)) {
            throw lxHelpers.getTypeError('navigation', user, []);
        }

        var result = [];

        lxHelpers.forEach(navigation, function (item) {
            var navItem = lxHelpers.clone(item);

            // process child navigation items
            if (item.children) {
                navItem.children = pub.secureNavigation(user, item.children);
            }

            // check if navigation item needs a right/resource to be visible and check if the user has that right/resource
            if (!item.hasOwnProperty('right') || pub.userHasAccessTo(user, item.right)) {
                // delete rigth from navigation item
                if (navItem.right) {
                    delete navItem.right;
                }

                result.push(navItem);
            }
        });

        return result;
    };

    /**
     * Returns the rights repositories.
     */
    pub.getRepositories = function () {
        return require('./repositories')(config.mongo.rights);
    };

    /**
     * Gets the user object with login data.
     *
     * @param {string} username The name of the user.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.getUserForLogin = function (username, callback) {
        var repo = pub.getRepositories().users;

        repo.getOne({username: username}, {fields: ['username', 'hash', 'salt']}, function (error, result) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error.toString(), username);
                callback(error, null);
                return;
            }

            callback(null, result);
        });
    };

    /**
     * Gets the user with his acl object.
     *
     * @param {Object|number} id The user id.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.getUser = function (id, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isFunction(callback)) {
            throw lxHelpers.getTypeError('callback', callback, function () {});
        }

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
            getUserRoles: ['getUser', 'getUserGroups', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups || [];

                    lxHelpers.forEach(groups, function (group) {
                        lxHelpers.forEach(group.roles, function (role) {
                            roles.push(role);
                        });
                    });

                    rightsRepo.roles.getAll({_id: {$in: roles}}, next);
                }
            }],
            getUserResourceRights: ['getUser', 'getUserGroups', 'getUserRoles', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups || [],
                        roleIds = [],
                        groupIds = [];

                    lxHelpers.forEach(groups, function (group) {
                        groupIds.push(group._id);
                    });

                    lxHelpers.forEach(roles, function (role) {
                        roleIds.push(role._id);
                    });

                    var query = {
                        $or: [
                            {user_id: results.getUser._id},
                            {group_id: {$in: groupIds}},
                            {role_id: {$in: roleIds}}
                        ]
                    };

                    rightsRepo.resourceRights.getAll(query, next);
                }
            }],
            normalizeResourceRights: ['getUserResourceRights', function (next, results) {
                var resourceRights = results.getUserResourceRights,
                    result = [];

                async.each(resourceRights, function (resourceRight, innerCallback) {
                    if (resourceRight.right_id) {
                        result.push(resourceRight);
                        innerCallback();
                    } else if (resourceRight.role_id) {
                        rightsRepo.roles.getOneById(resourceRight.role_id, function (error, role) {
                            if (error) {
                                innerCallback(error);
                                return;
                            }

                            lxHelpers.forEach(role.rights, function (rightId) {
                                result.push({right_id: rightId, resource: resourceRight.resource});
                            });

                            innerCallback();
                        });
                    }
                }, function (error) {
                    next(error, result);
                });
            }],
            getUserAcl: ['getAllRights', 'normalizeResourceRights', function (next, results) {
                var user = results.getUser;

                if (!user) {
                    next(null, {});
                    return;
                }

                user.acl = pub.getUserAcl(user, results.getAllRights, results.getUserRoles, results.getUserGroups, [], results.normalizeResourceRights);

                // delete protected properties
                delete user.hash;
                delete user.salt;

                next(null, user);
            }]
        }, function (error, results) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error, id);
                callback(new Error('Error loading user from db!'));
                return;
            }

            callback(null, results.getUserAcl);
        });
    };

    /**
     * Extends the acl of the user with the rights of the specified additional roles.
     *
     * @param {!Object} user The user object.
     * @param {!Array} additionalRoles The additional roles for the user.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.getExtendedAcl = function (user, additionalRoles, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isFunction(callback)) {
            throw lxHelpers.getTypeError('callback', callback, function () {});
        }

        if (lxHelpers.isEmpty(additionalRoles) || lxHelpers.isEmpty(user)) {
            callback();
            return;
        }

        if (!lxHelpers.isObject(user)) {
            callback(lxHelpers.getTypeError('user', user, {}));
            return;
        }

        if (!lxHelpers.isArray(additionalRoles)) {
            callback(lxHelpers.getTypeError('additionalRoles', additionalRoles, []));
            return;
        }

        async.auto({
            getRoles: function (next) {
                var rolesQuery = (typeof additionalRoles[0] === 'string') ? {name: {$in: additionalRoles}} : {_id: {$in: additionalRoles}};
                rightsRepo.roles.getAll(rolesQuery, next);
            },
            getAllRights: function (next) {
                rightsRepo.rights.getAll(next);
            },
            getUserRoles: function (next, results) {
                if (lxHelpers.isEmpty(user.roles)) {
                    next(null, []);
                } else {
                    rightsRepo.roles.getAll({_id: {$in: results.getUser.roles}}, next);
                }
            },
            getUserGroups: function (next, results) {
                if (lxHelpers.isEmpty(user.groups)) {
                    next(null, []);
                } else {
                    rightsRepo.groups.getAll({_id: {$in: results.getUser.groups}}, next);
                }
            },
            getAcl: ['getRoles', 'getAllRights', 'getUserRoles', 'getUserGroups', function (next, results) {
                var acl = {};

                if (results.getGroups && !lxHelpers.isEmpty(results.getGroups)) {
                    acl = pub.getUserAcl(user, results.getAllRights, results.getUserRoles, results.getUserGroups, results.getRoles);
                }

                next(null, acl);
            }]
        }, function (err, results) {
            if (err) {
                logging.syslog.error(err);
                callback(err);
                return;
            }

            callback(null, results.getAcl);
        });
    };

    /**
     * Adds a resource right in db.
     *
     * @param {*} resource The resource.
     * @param {!Object} options The options.
     * @param {Object=} options.group_id The id of the group.
     * @param {Object=} options.user_id The id of the user.
     * @param {Object=} options.role_id The id of the role.
     * @param {Object=} options.right_id The id of the right.
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.addResourceRight = function (resource, options, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isObject(options)) {
            throw lxHelpers.getTypeError('options', options, {});
        }

        // check params
        if (!lxHelpers.isFunction(callback)) {
            throw lxHelpers.getTypeError('callback', callback, Function);
        }

        if (!resource || lxHelpers.isEmpty(options)) {
            throw new Error('Missing param resource or empty param options!');
        }

        if (!options.group_id && !options.user_id) {
            throw new Error('Missing param options.group_id or missing param options.user_id!');
        }

        if (!options.role_id && !options.right_id) {
            throw new Error('Missing param options.role_id or missing param options.right_id!');
        }

        options.resource = resource;

        rightsRepo.resourceRights.create(options, function (error, result) {
            if (error) {
                logging.syslog.error('rights: Error creating resource right %j', options);
                callback(error);
                return;
            }

            if (result) {
                logging.syslog.info('rights: Creating resource right %j', options);
            }

            callback(null, result);
        });
    };

    /**
     * Returns the public functions from the controllers of the app.
     *
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.getPublicFunctionsFromControllers = function (callback) {
        var glob = require('glob'),
            fs = require('fs'),
            pattern = config.path.modules + '/**/controllers/*.js',
            libControllers = config.path.libControllers + '/**/*.js',
            result = {};

        glob(libControllers, function (err, controllers) {
            lxHelpers.arrayRemoveItem(controllers, config.path.libControllers + '/index.js');

            // get all contoller files
            glob(pattern, function (error, controllers1) {
                lxHelpers.arrayPushAll(controllers, controllers1);

                if (error) {
                    callback(error);
                    return;
                }

                async.eachSeries(controllers, function (controllerFile, next) {
                    fs.exists(controllerFile, function (fileExists) {
                        if (fileExists) {
                            var modulePath = '';

                            fs.readFile(controllerFile, {encoding: 'utf8'}, function (error, file) {
                                if (error) {
                                    next(error);
                                    return;
                                }

                                var splittedFileName = controllerFile.split('/');
                                var contollerName = splittedFileName.pop().replace('.js', '');
                                splittedFileName.pop();
                                var moduleName = splittedFileName.pop();

                                var i = splittedFileName.length - 1;

                                if (lxHelpers.arrayHasItem(splittedFileName, 'modules')) {
                                    while (splittedFileName[i] !== 'modules') {
                                        modulePath = splittedFileName[i] + '/' + modulePath;
                                        i--;
                                    }
                                }
//                                else {
//                                    modulePath = splittedFileName[i] + '/' + modulePath;
//                                }

//                                while (splittedFileName[i] !== 'modules') {
//                                    modulePath = splittedFileName[i] + '/' + modulePath;
//                                    i--;
//                                }

                                var splittedFile = file.split('pub.');
                                var length = splittedFile.length;

                                for (i = 1; i < length; i++) {
                                    var functionName = splittedFile[i].split('=');
                                    var fullPathToRight = modulePath + moduleName + '/' + contollerName + '/' + functionName[0].trim();
                                    var roles = getInfoFromComment(splittedFile[i - 1], 'roles');
                                    var description = getInfoFromComment(splittedFile[i - 1], 'description');
                                    var right = {
                                        name: fullPathToRight
                                    };

                                    if (description) {
                                        right.description = description;
                                    }

                                    if (roles) {
                                        right.roles = roles.split(',');
                                    }

                                    result[right.name] = right;
                                }

                                next();
                            });
                        } else {
                            next();
                        }
                    });
                }, function (error) {
                    var resultArray = [];

                    lxHelpers.forEach(result, function (key, value) {
                        resultArray.push(value);
                    });

                    callback(error, resultArray);
                });
            });

        });
    };

    /**
     * Reads the rights from the contollers and saves them in db.
     *
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.refreshRightsIdDb = function (callback) {
        var repo = pub.getRepositories(),
            rightsCreated = 0;

        pub.getPublicFunctionsFromControllers(function (error, rights) {
            if (error) {
                callback(error);
                return;
            }

            var roles = {};

            function addRightToRoles (rightRoles, rightId) {
                lxHelpers.forEach(rightRoles, function (role) {
                    role = role.trim();
                    roles[role] = roles[role] || {};
                    roles[role].rights = roles[role].rights || [];
                    roles[role].rights.push(rightId);
                });
            }

            async.each(rights, function (right, next) {
                repo.rights.getOne({name: right.name}, function (error, result) {
                    if (error) {
                        next(error);
                        return;
                    }

                    if (!result) {
                        repo.rights.create({name: right.name, description: right.description}, function (error, result) {
                            if (error) {
                                next(error);
                                return;
                            }

                            if (result) {
                                logging.syslog.info('rights: Created right %j', right);
                                rightsCreated++;
                                addRightToRoles(right.roles, result[0]._id);
                                next();
                            }
                        });
                    } else {
                        addRightToRoles(right.roles, result._id);

                        right.description = right.description || '';

                        if (result.description !== right.description) {
                            repo.rights.update({_id: result._id}, {$set: {description: right.description}}, function (error, result) {
                                if (error) {
                                    next(error);
                                    return;
                                }

                                if (result) {
                                    logging.syslog.info('rights: Updated right %j', right);
                                    rightsCreated++;
                                    next();
                                }
                            });
                        } else {
                            next();
                        }
                    }
                });
            }, function (error) {
                if (!lxHelpers.isEmpty(roles)) {
                    var roleKeys = Object.keys(roles);

                    async.each(roleKeys, function (roleName, next) {
                        repo.roles.getOne({name: roleName}, function (error, result) {
                            if (error) {
                                next(error);
                                return;
                            }

                            if (result) {
                                repo.roles.update({_id: result._id}, {$set: {rights: roles[roleName].rights}}, function (error, result) {
                                    if (error) {
                                        next(error);
                                        return;
                                    }

                                    if (result) {
                                        logging.syslog.info('rights: Updated rights of role %s', roleName);
                                        next();
                                    }
                                });
                            } else {
                                repo.roles.create({name: roleName, rights: roles[roleName].rights}, function (error, result) {
                                    if (error) {
                                        next(error);
                                        return;
                                    }

                                    if (result) {
                                        logging.syslog.info('rights: Created role %s', roleName);
                                        next();
                                    }
                                });
                            }
                        });
                    }, function (error) {
                        callback(error, rightsCreated);
                    });
                } else {
                    callback(error, rightsCreated);
                }
            });
        });
    };

    /**
     * Creates the system users in db if they do not exist.
     *
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.ensureThatDefaultSystemUsersExists = function (callback) {
        var repo = pub.getRepositories().users,
            systemUsers = [
                {id: -1, username: 'guest', locked: true},
                {id: 2, username: 'admin', locked: true, password: 'a'},
                {id: 1, username: 'sysadmin', locked: true, password: 'a'}
            ],
            usersCreated = 0;

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
                                    usersCreated++;
                                    next();
                                }
                            });
                        }
                    });
                }
            });
        }, function (error) {
            callback(error, usersCreated);
        });
    };

    /**
     * Erweiterungen von Timo wahrscheinlich ins eigene usermodul auslagern.
     */

    /**
     * findOrCreateUser
     * Search externally authenticated user in the database by email or save it.
     *
     * @param {string} email
     * @param {string} displayName
     * @param {function(?Object=, ?Object=)} callback The callback.
     */
    pub.findOrCreateUser = function (email, displayName, callback) {

        var repo = pub.getRepositories().users;

        repo.getOne({email: email}, function (error, user) {
            if (error) {
                callback(error);
            }
            else if (user) {
                callback(null, user);
            }
            else {
                repo.create(
                    {
                        id: 3,
                        displayName: displayName,
                        email: email,
                        roles: [repo.convertId('527b73d2b13403a026000028')],
                        locked: false
                    },
                    function (error, result) {
                        if (error) {
                            callback(error);
                        }
                        else if (result) {
                            callback(null, result);
                        }
                        else {
                            callback({error: 'Unknown error by create user with email:' + email });
                        }
                    }
                );
            }

        });

    };

    return pub;
};