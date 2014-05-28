'use strict';

var async = require('async'),
    crypto = require('./crypto')(),
    os = require('os'),
    lxHelpers = require('lx-helpers'),
    RightsError = require('./errors').RightsError;

/**
 * Returns the rights module.
 *
 * @param {Object} config The config.
 * @param {Object} config.rights The rights object with options and db connection string.
 * @param {Object} config.path The path object with all app paths.
 * @param {Object} logging The logging object.
 * @param {Object} logging.syslog The syslogger.
 * @return {Object} An object with methods for using right system.
 */
module.exports = function (config, logging) {
    // check parameters
    if (typeof config !== 'object') {
        throw new RightsError('Parameter config is required and must be a object type!');
    }

    if (typeof logging !== 'object') {
        throw new RightsError('Parameter logging is required and must be a object type!');
    }

    var pub = {};

    config.rights = config.rights || {};

    function createHash(user, callback) {
        if (user.password) {
            crypto.hashWithRandomSalt(user.password, function(error, data) {

                if (!error && data) {
                    user.salt = data.salt;
                    user.password = data.password;

                    callback(null, user);
                }
                else {
                    callback(error || new RightsError('Unknown error in create hash'));
                }
            });
        } else {
            callback(null, user);
        }
    }

    function addRoleRights(roles, allRoles, result) {
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

    function getInfoFromComment(comment, type) {
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
            throw new RightsError('param "user" is not an object');
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
        lxHelpers.forEach(tmp, function (right) {
            result.push(right);
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
            throw new RightsError('param "user" is not an object');
        }

        var result = {};

        // admin role has access to all rights
        if (pub.userIsInRole(user, 'Admin')) {
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
        // check params
        if (!lxHelpers.isObject(user)) {
            throw new RightsError('param "user" is not an object');
        }

        // return true when rights system is disabled
        if (config.rights.enabled === false) {
            return true;
        }

        // always true for sysadmin
        if (user.name === 'sysadmin') {
            return true;
        }

        // check by acl
        if (user.acl) {
            if (resource) {
                return user.acl[right] && user.acl[right].hasAccess && user.acl[right].resource === resource;
            }

            return user.acl[right] && user.acl[right].hasAccess;
        }

        return false;
    };

    /**
     * Returns if the user has a given role.
     *
     * @param {!Object} user The user object.
     * @param {!Object|string} role The name or id of the role.
     */
    pub.userIsInRole = function (user, role) {
        // check params
        if (!lxHelpers.isObject(user)) {
            throw new RightsError('param "user" is not an object');
        }

        // always return true when the rights system is disabled
        if (config.rights.enabled === false) {
            return true;
        }

        if (typeof role !== 'string') {
            role = role.toString();
        }

        var roleFound = lxHelpers.arrayFirst(user.rolesAsObjects, function (roleObj) {
            return roleObj._id.toString() === role || roleObj.name === role;
        });

        return !!roleFound;
    };

    /**
     * Adds the role to the user if not already in list of roles
     *
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    pub.addRoleToUser = function (user, role, callback) {
        if(pub.userIsInRole(user, role)){
            callback();
            return;
        }

        var userRepo = pub.getRepositories().users,
            roleRepo = pub.getRepositories().roles;

        // get user
        userRepo.findOne({name: user.name}, function (error, userObj) {
            if (error || !userObj) {
                callback(error || new RightsError('user ' + user.name + ': not found', 400));
                return;
            }

            // get role
            roleRepo.findOne({name: role}, function (error, roleObj) {
                if (error || !roleObj) {
                    callback(error || new RightsError('role ' + role + ': not found', 400));
                    return;
                }

                // update user
                userRepo.update({_id: userObj._id}, {$push:{roles: roleObj._id}}, function (error) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    user.roles = user.roles || [];
                    user.rolesAsObjects = user.rolesAsObjects || [];

                    user.roles.push({_id: roleObj._id});
                    user.rolesAsObjects.push({_id: roleObj._id, name: roleObj.name});

                    callback(null, user);
                });
            });
        });
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

            lxHelpers.forEach(acl, function (value, right) {
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

        if (config.rights.enabled === false) {
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
            throw new RightsError('param "user" is not an object');
        }

        if (!lxHelpers.isArray(navigation)) {
            throw new RightsError('param "navigation" is not an array');
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
        return require('./repositories')(config.rights.database);
    };

    /**
     * Gets the user with his acl object.
     *
     * @param {Object|number} id The user id.
     * @param {Function} callback The callback. (?Object=, ?Object=).
     */
    pub.getUser = function (name, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isString(name)) {
            throw new RightsError('param "name" is not a string');
        }

        if (!lxHelpers.isFunction(callback)) {
            throw new RightsError('param "callback" is not a function');
        }

        async.auto({
            getUser: function (next) {
                rightsRepo.users.findOne({name: name}, next);
            },
            getAllRights: function (next) {
                rightsRepo.rights.find(next);
            },
            getUserGroups: ['getUser', function (next, results) {
                if (!results.getUser || lxHelpers.isEmpty(results.getUser.groups)) {
                    next(null, []);
                } else {
                    rightsRepo.groups.find({_id: {$in: results.getUser.groups}}, next);
                }
            }],
            getUserRoles: ['getUser', 'getUserGroups', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups;

                    lxHelpers.forEach(groups, function (group) {
                        lxHelpers.forEach(group.roles, function (role) {
                            roles.push(role);
                        });
                    });

                    rightsRepo.roles.find({_id: {$in: roles}}, next);
                }
            }],
            getUserResourceRights: ['getUser', 'getUserGroups', 'getUserRoles', function (next, results) {
                if (!results.getUser) {
                    next(null, []);
                } else {
                    var roles = results.getUser.roles || [],
                        groups = results.getUserGroups,
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

                    rightsRepo.resourceRights.find(query, next);
                }
            }],
            normalizeResourceRights: ['getUserResourceRights', function (next, results) {
                var resourceRights = results.getUserResourceRights,
                    result = [];

                async.each(resourceRights, function (resourceRight, innerCallback) {
                    if (resourceRight.right_id) {
                        result.push(resourceRight);
                        innerCallback();
                    } else {
                        rightsRepo.roles.findOneById(resourceRight.role_id, function (error, role) {
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
            getUserAcl: ['getAllRights', 'getUserRoles', 'normalizeResourceRights', function (next, results) {
                var user = results.getUser;
                var userRoles = results.getUserRoles;

                if (!user) {
                    next(null, {});
                    return;
                }

                // save user roles in extra property
                user.rolesAsObjects = [];

                lxHelpers.forEach(userRoles, function (role) {
                    user.rolesAsObjects.push({_id: role._id, name: role.name});
                });

                user.acl = pub.getUserAcl(user, results.getAllRights, results.getUserRoles, results.getUserGroups, [], results.normalizeResourceRights);

                // delete protected properties
                //delete user.password;
                //delete user.salt;

                next(null, user);
            }]
        }, function (error, results) {
            if (error) {
                logging.syslog.error('%s! getting user from db: %j', error, name);
                callback(new RightsError('Error loading user from db!'));
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
     * @param {Function} callback The callback(?Object=, ?Object=).
     */
    pub.getExtendedAcl = function (user, additionalRoles, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isFunction(callback)) {
            throw new RightsError('param "callback" is not a function');
        }

        if (lxHelpers.isEmpty(additionalRoles) || lxHelpers.isEmpty(user)) {
            callback();
            return;
        }

        if (!lxHelpers.isObject(user)) {
            callback(new RightsError('param "user" is not an object'));
            return;
        }

        if (!lxHelpers.isArray(additionalRoles)) {
            callback(new RightsError('param "additionalRoles" is not an array'));
            return;
        }

        async.auto({
            getRoles: function (next) {
                var rolesQuery = (typeof additionalRoles[0] === 'string') ? {name: {$in: additionalRoles}} : {_id: {$in: additionalRoles}};
                rightsRepo.roles.find(rolesQuery, next);
            },
            getAllRights: function (next) {
                if (lxHelpers.isEmpty(user.rights)) {
                    next(null, []);
                } else {
                    rightsRepo.rights.find({_id: {$in: user.rights}}, next);
                }

            },
            getUserRoles: function (next) {
                if (lxHelpers.isEmpty(user.roles)) {
                    next(null, []);
                } else {
                    rightsRepo.roles.find({_id: {$in: user.roles}}, next);
                }
            },
            getUserGroups: function (next) {
                if (lxHelpers.isEmpty(user.groups)) {
                    next(null, []);
                } else {
                    rightsRepo.groups.find({_id: {$in: user.groups}}, next);
                }
            },
            getAcl: ['getRoles', 'getAllRights', 'getUserRoles', 'getUserGroups', function (next, results) {
                var acl = {};

                if (results.getUserGroups && !lxHelpers.isEmpty(results.getUserGroups)) {
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
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    pub.addResourceRight = function (resource, options, callback) {
        var rightsRepo = pub.getRepositories();

        // check params
        if (!lxHelpers.isFunction(callback)) {
            throw new RightsError('param "callback" is not a function');
        }

        if (!lxHelpers.isObject(options)) {
            callback(new RightsError('param "options" is not an object'));
            return;
        }

        if (!resource || lxHelpers.isEmpty(options)) {
            callback(new RightsError('missing param "resource" or param "options" is empty'));
            return;
        }

        if (!options.group_id && !options.user_id) {
            callback(new RightsError('missing param "options.group_id" or missing param "options.user_id"'));
            return;
        }

        if (!options.role_id && !options.right_id) {
            callback(new RightsError('missing param "options.role_id" or missing param "options.right_id"'));
            return;
        }

        options.resource = resource;

        rightsRepo.resourceRights.insert(options, function (error, result) {
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
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    pub.getPublicFunctionsFromControllers = function (callback) {
        var glob = require('glob'),
            fs = require('fs'),
            pattern = config.path.modules + '/**/controllers/*.js',
            result = {};

        // get all contoller files
        glob(pattern, function (error, controllers) {
            if (error) {
                callback(error);
                return;
            }

            async.eachSeries(controllers, function (controllerFile, next) {
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
            }, function (error) {
                var resultArray = [];

                lxHelpers.forEach(result, function (value) {
                    resultArray.push(value);
                });

                callback(error, resultArray);
            });
        });
    };

    /**
     * Reads the rights from the contollers and saves them in db.
     *
     * @param {Function} callback The callback. (?Object=, ?Object=)
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

            function addRightToRoles(rightRoles, rightId) {
                lxHelpers.forEach(rightRoles, function (role) {
                    role = role.trim();
                    roles[role] = roles[role] || {};
                    roles[role].rights = roles[role].rights || [];
                    roles[role].rights.push(rightId);
                });
            }

            async.each(rights, function (right, next) {
                repo.rights.findOne({name: right.name}, function (error, result) {
                    if (error) {
                        next(error);
                        return;
                    }

                    if (!result) {
                        repo.rights.insert({name: right.name, description: right.description}, function (error, result) {
                            if (error) {
                                next(error);
                                return;
                            }

                            if (result) {
                                logging.syslog.info('rights: Created right %j', right);
                                rightsCreated++;
                                addRightToRoles(right.roles, result[0]._id);
                            }

                            next();
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
                                }

                                next();
                            });
                        } else {
                            next();
                        }
                    }
                });
            }, function (error) {
                if (error) {
                    callback(error);
                    return;
                }

                if (!lxHelpers.isEmpty(roles)) {
                    var roleKeys = Object.keys(roles);

                    async.each(roleKeys, function (roleName, next) {
                        repo.roles.findOne({name: roleName}, function (error, result) {
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
                                    }

                                    next();
                                });
                            } else {
                                repo.roles.insert({name: roleName, rights: roles[roleName].rights}, function (error, result) {
                                    if (error) {
                                        next(error);
                                        return;
                                    }

                                    if (result) {
                                        logging.syslog.info('rights: Created role %s', roleName);
                                    }

                                    next();
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
     * @param {Function} callback The callback. (?Object=, ?Object=)
     */
    pub.ensureThatDefaultSystemUsersExists = function (callback) {
        if (config.rights.enabled === false) {
            return callback(null, 0);
        }

        var userRepo = pub.getRepositories().users,
            roleRepo = pub.getRepositories().roles,
            systemRoles = [
                {name: 'Guest', description: 'The default guest role.'},
                {name: 'User', description: 'The default user role.'},
                {name: 'Admin', description: 'The default admin role. This role has access to all rights.'}
            ],
            systemUsers = [
                {name: 'guest', locked: true, display_name: 'Guest'},
                {name: 'admin', locked: true, password: 'a', display_name: 'Admin', is_active: true},
                {name: 'sysadmin', locked: true, password: 'a', display_name: 'SysAdmin', is_active: true}
            ],
            usersCreated = 0;

        async.auto({
            createSystemRoles: function (next) {
                var roles = {};

                async.each(systemRoles, function (role, innerNext) {
                    roleRepo.findOne({name: role.name}, function (error, result) {
                        if (error) {
                            return innerNext(error);
                        }

                        if (result) {
                            roles[result.name] = result._id;
                            innerNext();
                        } else {
                            roleRepo.insert(role, function (error, result) {
                                roles[result[0].name] = result[0]._id;
                                logging.syslog.info('rights: Created new role in db: %j', role);

                                innerNext(error);
                            });
                        }
                    });
                }, function (error) {
                    next(error, roles);
                });
            },
            createSystemUsers: ['createSystemRoles', function (next, results) {
                async.each(systemUsers, function (user, innerNext) {
                    userRepo.findOne({name: user.name, locked: true}, function (error, result) {
                        if (error) {
                            return innerNext(error);
                        }

                        if (result) {
                            innerNext();
                        } else {
                            createHash(user, function (error, userWithPasswordHash) {
                                if (error) {
                                    return innerNext(error);
                                }

                                if (userWithPasswordHash.name === 'guest') {
                                    userWithPasswordHash.roles = [results.createSystemRoles.Guest];
                                }

                                if (userWithPasswordHash.name === 'admin') {
                                    userWithPasswordHash.roles = [results.createSystemRoles.Admin];
                                }

                                userRepo.insert(userWithPasswordHash, function (error, result) {
                                    if (error) {
                                        return innerNext(error);
                                    }

                                    if (result) {
                                        logging.syslog.info('rights: Created new user in db: %j', result);
                                        usersCreated++;
                                    }

                                    innerNext();
                                });
                            });
                        }
                    });
                }, next);
            }]
        }, function (error) {
            callback(error, usersCreated);
        });
    };
 
    return pub;
};