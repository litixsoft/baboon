'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (enterpriseConnection) {
    var db = lxDb.GetDb(enterpriseConnection, ['crew']),
        crewRepo = require('./crewRepository')(db.crew);

    return {
        crew: crewRepo
    };
};
