'use strict';

var grunt = require('grunt'),
    path = require('path'),
    async = require('async'),
    rootPath = path.resolve(),
    config = require('../../lib/config.js')(rootPath),
    logging = require('../../lib/logging.js')(
        config.path.logs, config.nodeEnv, config.logging.maxLogSize, config.logging.backups),
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

                repo.users.getAll({name: { $in: ['admin', 'guest']}}, {fields: ['_id', 'name', 'roles']}, function (error, result) {
                    if (error) {
                        finalCallback(error);
                        return;
                    }

                    async.eachSeries(result, function (user, next) {
                        var idx;
                        user.roles = user.roles || [];

                        if (user.name === 'admin') {
                            idx = user.roles.indexOf(roles.Admin);

                            if (idx === -1) {
                                user.roles.push(roles.Admin);

                                repo.users.update({_id: user._id}, {$set: user}, next);
                            }
                        } else if (user.name === 'guest') {
                            idx = user.roles.indexOf(roles.Guest);

                            if (idx === -1) {
                                user.roles.push(roles.Guest);

                                repo.users.update({_id: user._id}, {$set: user}, next);
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