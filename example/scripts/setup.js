'use strict';

var grunt = require('grunt'),
    path = require('path'),
    async = require('async'),
    lxHelpers = require('lx-helpers'),
    rootPath = path.resolve(),
    config = require('../../lib/config.js')(rootPath),
    logging = require('../../lib/logging.js')(config),
    rights = require('../../lib/rights')(config, logging);

grunt.log.ok('Start setup script for baboon example app.');

function finalCallback (error) {
    if (error) {
        grunt.log.error(error);
        process.exit(1);
    }

    grunt.log.ok('Setup was successfully.');
    process.exit(0);
}

// create default system users
rights.ensureThatDefaultSystemUsersExists(function (error) {
    if (error) {
        finalCallback(error);
        return;
    }

    grunt.log.ok('rights: All system users are there.');

    if (config.useRightsSystem) {
        // create/refresh rights in db
        rights.refreshRightsIdDb(function (error) {
            if (error) {
                finalCallback(error);
                return;
            }

            grunt.log.ok('rights: All rights are stored in db.');

            // add roles to users
            var repo = rights.getRepositories();
            repo.roles.getAll({}, {fields: ['_id', 'name']}, function (error, result) {
                if (error) {
                    finalCallback(error);
                    return;
                }

                var roles = {};

                result.forEach(function (role) {
                    roles[role.name] = role._id;
                });

                repo.users.getAll({username: { $in: ['admin', 'guest']}}, {fields: ['_id', 'username', 'roles']}, function (error, result) {
                    if (error) {
                        finalCallback(error);
                        return;
                    }

                    async.eachSeries(result, function (user, next) {
                        var roleExists = false;
                        user.roles = user.roles || [];

                        if (user.username === 'admin') {
                            lxHelpers.forEach(user.roles, function (role) {
                                if (role.toString() === roles.Admin.toString()) {
                                    roleExists = true;
                                    return false;
                                }
                            });

                            if (!roleExists && roles.Admin) {
                                user.roles.push(roles.Admin);

                                repo.users.update({_id: user._id}, {$set: user}, next);
                            } else {
                                next();
                            }
                        } else if (user.username === 'guest') {
                            lxHelpers.forEach(user.roles, function (role) {
                                if (role.toString() === roles.Guest.toString()) {
                                    roleExists = true;
                                    return false;
                                }
                            });

                            if (!roleExists && roles.Guest) {
                                user.roles.push(roles.Guest);

                                repo.users.update({_id: user._id}, {$set: user}, next);
                            } else {
                                next();
                            }
                        } else {
                            next();
                        }
                    }, finalCallback);
                });
            });

//            finalCallback();
        });
    } else {
        finalCallback();
    }
});