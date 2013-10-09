'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (rightsConnection) {
    var db = lxDb.GetDb(rightsConnection, ['users', 'groups', 'rights', 'roles', 'resource_rights']),
        usersRepo = require('./usersRepository')(db.users),
        groupsRepo = require('./groupsRepository')(db.groups),
        rolesRepo = require('./rolesRepository')(db.roles),
        resourceRightsRepo = require('./resourceRightsRepository')(db.resource_rights),
        rightsRepo = require('./rightsRepository')(db.rights);

    return {
        users: usersRepo,
        groups: groupsRepo,
        roles: rolesRepo,
        resourceRights: resourceRightsRepo,
        rights: rightsRepo
    };
};