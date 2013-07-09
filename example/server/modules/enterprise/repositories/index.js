module.exports = function (config) {
    'use strict';

    if (!config) {
        throw new Error('missing config');
    }

    //noinspection JSUnresolvedVariable
    var lxDb = require('lx-mongodb'),
        //noinspection JSUnresolvedVariable
        db = lxDb.GetDb(config.mongo.enterprise, ['crew']),
        crewRepo = require('./crew')(db.crew);

    // Enterprise API

    return {
        crew: crewRepo
    };
};
