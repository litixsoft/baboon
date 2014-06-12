'use strict';

var lxDb = require('lx-mongodb');

/**
 * Index
 *
 * @param rightsConnection
 * @returns {Object}
 */
module.exports = function (rightsConnection) {
    var db = lxDb.GetDb(rightsConnection, ['users', 'groups', 'rights', 'roles', 'resource_rights','token']),
        usersRepo = require('./usersRepository')(db.users),
        groupsRepo = require('./groupsRepository')(db.groups),
        rolesRepo = require('./rolesRepository')(db.roles),
        resourceRightsRepo = require('./resourceRightsRepository')(db.resource_rights),
        rightsRepo = require('./rightsRepository')(db.rights),
        tokenRepo = lxDb.BaseRepo(db.token);

    return {
        users: usersRepo,
        groups: groupsRepo,
        roles: rolesRepo,
        resourceRights: resourceRightsRepo,
        rights: rightsRepo,
        token: tokenRepo
    };
};