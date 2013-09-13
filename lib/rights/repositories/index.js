'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (rightsConnection) {
    var db = lxDb.GetDb(rightsConnection, ['users', 'groups', 'rights']),
        usersRepo = require('./usersRepository')(db.users),
        groupsRepo = require('./groupsRepository')(db.groups),
        rightsRepo = require('./rightsRepository')(db.rights);

    return {
        users: usersRepo,
        groups: groupsRepo,
        rights: rightsRepo
    };
};