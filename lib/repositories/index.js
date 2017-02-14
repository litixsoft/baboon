'use strict';

var lxDb = require('../lx-mongodb-core');

/**
 * Index
 *
 * @param rightsConnection
 * @returns {Object}
 */
module.exports = function (rightsConnection) {
    var db = lxDb.GetDb(rightsConnection),
        usersRepo = require('./usersRepository')(db.collection('users')),
        groupsRepo = require('./groupsRepository')(db.collection('groups')),
        rolesRepo = require('./rolesRepository')(db.collection('roles')),
        resourceRightsRepo = require('./resourceRightsRepository')(db.collection('resource_rights')),
        rightsRepo = require('./rightsRepository')(db.collection('rights')),
        tokenRepo = lxDb.BaseRepo(db.collection('token'));

    return {
        users: usersRepo,
        groups: groupsRepo,
        roles: rolesRepo,
        resourceRights: resourceRightsRepo,
        rights: rightsRepo,
        token: tokenRepo
    };
};