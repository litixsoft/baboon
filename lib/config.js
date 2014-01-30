'use strict';
var lxHelpers = require('lx-helpers'),
    path = require('path'),
    fs = require('fs');

// overwrite config properties
function overwriteProperties (obj1, obj2) {
    lxHelpers.objectForEach(obj1, function (value, key1) {
        lxHelpers.objectForEach(obj2, function (value2, key2) {
            if (key1 === key2) {
                obj1[key1] = value2;
            }
        });
    });
}

module.exports = function (rootPath, notice) {
    var configFile = require(path.join(rootPath, 'config', 'app.conf.json')),
        config = configFile.base,
        params = configFile.params,
        args = process.argv.splice(2);

    notice = notice || function (msg) {
        return msg;
    };

    // check params and overwrite base config when param exists in config
    if (args.length === 1) {
        // find section in config
        lxHelpers.objectForEach(params, function (value, key) {
            if (key === args[0]) {
                overwriteProperties(config, value);
                console.log(notice('   info  - ') + 'override base config with param: ' + key);
            }
        });
    }

    // check NODE_ENV and overwrite config when exists or setting NODE_ENV from config
    var envTmp = process.env.NODE_ENV;

    //if (typeof envTmp !== 'undefined') {
    if (typeof envTmp !== 'undefined' && envTmp !== 'undefined') {
        // get environment setting
        console.log(notice('   info  - ') + 'setting config.node_env from environment to: ' + envTmp);
        config.node_env = envTmp;

        // find section in config
        lxHelpers.objectForEach(params, function (value, key) {
            if (key === envTmp) {
                overwriteProperties(config, value);
                console.log(notice('   info  - ') + 'override base config with param: ' + key);
            }
        });
    } else {
        // set environment
        console.log(notice('   info  - ') + 'setting process.env.NODE_ENV environment from config to: ' + config.node_env);
        process.env.NODE_ENV = config.node_env;
    }

    // extend config
    config.path = {};
    config.path.root = rootPath;
    config.path.build = path.join(rootPath, 'build');
    config.path.dist = path.join(rootPath, 'build', 'dist');
    config.path.public = path.join(rootPath, 'build', 'dist', 'public');
    config.path.logs = path.join(rootPath, 'server', 'logs');
    config.path.api = path.join(__dirname, 'api');
    config.path.modules = path.join(rootPath, 'server', 'modules');
    config.path.libControllers = path.join(__dirname, 'controllers');

    var pathToNavigation = path.join(rootPath, 'config', 'navigation.js');

    // register path to navigation if navigation exists
    if (fs.existsSync(pathToNavigation)) {
        config.path.navigation = path.join(rootPath, 'config', 'navigation.js');
    }

    return config;
};