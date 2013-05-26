'use strict';
var lxHelpers = require('lx-helpers');

module.exports = function (rootPath, notice) {
    var path = require('path'),
        configFile = require(path.join(rootPath, 'config', 'app.conf.json')),
        config = configFile.base,
        params = configFile.params,
        args = process.argv.splice(2);

    notice = notice || function (msg) {
        return msg;
    };

    // overwrite config properties
    function overwriteProperties (obj1, obj2) {
        lxHelpers.objectForEach(obj1, function (key1) {
            lxHelpers.objectForEach(obj2, function (key2, value2) {
                if (key1 === key2) {
                    obj1[key1] = value2;
                }
            });
        });
    }

    // check params and overwrite base config when param exists in config
    if (args.length === 1) {
        // find section in config
        lxHelpers.objectForEach(params, function (key) {
            if (key === args[0]) {
                overwriteProperties(config, params[key]);
                console.log(notice('   info  - ') + 'override base config with param: ' + key);
            }
        });
    }

    // check NODE_ENV and overwrite config when exists or setting NODE_ENV from config
    var envTmp = process.env.NODE_ENV;

    //if (typeof envTmp !== 'undefined') {
    if (typeof envTmp !== 'undefined' && envTmp !== 'undefined') {
        // get environment setting
        console.log(notice('   info  - ') + 'setting config nodeEnv from environment to: ' + envTmp);
        config.nodeEnv = envTmp;

        // find section in config
        lxHelpers.objectForEach(params, function (key) {
            if (key === envTmp) {
                overwriteProperties(config, params[key]);
            }
        });
    } else {
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
    config.path.repositories = path.join(rootPath, 'server', 'repositories');
    config.path.controllers = path.join(rootPath, 'server', 'controllers');

    return config;
};