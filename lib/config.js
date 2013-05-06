module.exports = function (rootPath, notice) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var path = require('path'),
        configFile = require(path.join(rootPath, 'config', 'app.conf.json')),
        config = configFile.base,
        params = configFile.params,
        args = process.argv.splice(2);

    // overwrite config properties
    function overwriteProperties(obj1, obj2) {
        for (var obj1Prop in obj1) {
            if (obj1.hasOwnProperty(obj1Prop)) {
                for (var obj2Prop in obj2) {
                    if (obj2.hasOwnProperty(obj2Prop)) {
                        if (obj1Prop === obj2Prop) {
                            obj1[obj1Prop] = obj2[obj2Prop];
                        }
                    }
                }
            }
        }
    }

    // check params and overwrite base config when param exists in config
    if (args.length === 1) {
        // find section in config
        for(var prop in params) {
            if(params.hasOwnProperty(prop)) {
                if(prop === args[0]) {
                    overwriteProperties(config, params[prop]);
                }
            }
        }
    }

    // check NODE_ENV and overwrite config when exists or setting NODE_ENV from config
    var envTmp = process.env.NODE_ENV;
    if(typeof envTmp !== 'undefined') {
        // get environment setting
        console.log(notice('   info  - ') + 'setting config nodeEnv from environment to: ' + envTmp);
        config.nodeEnv = envTmp;
    }
    else {
        // set environment
        console.log(notice('   info  - ') + 'setting NODE_ENV environment to: ' + config.nodeEnv);
        process.env.NODE_ENV = config.nodeEnv;
    }

    // extend config
    config.path = {};
    config.path.root = rootPath;
    config.path.build = path.join(rootPath, 'build');
    config.path.dist = path.join(rootPath, 'build', 'dist');
    config.path.public = path.join(rootPath, 'build', 'dist', 'public');
    config.path.logs = path.join(rootPath, 'server', 'logs');
    config.path.api = path.join(rootPath, 'server', 'api');

    return  config;
};