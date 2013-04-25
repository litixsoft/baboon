/**
 * config loader
 * @param rootPath
 * @returns {*}
 */
module.exports = function (rootPath) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var path = require('path'),
        fs = require('fs'),
        config = require(path.join(rootPath, 'config', 'app.conf.json')),
        args = process.argv.splice(2),
        tmp,
        configFilePath,
        serverMode = 'development',
        configFileName = 'development.conf.json';

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

    // setup serverMode and config filename
    if (args.length === 1) {
        serverMode = args[0];
        configFileName = args[0] + '.conf.json';

        // process.env serverMode
        //noinspection JSUnresolvedVariable
        process.env.NODE_ENV = serverMode;
    }
    else {
        //noinspection JSUnresolvedVariable
        if (typeof process.env.NODE_ENV !== 'undefined') {
            //noinspection JSUnresolvedVariable
            configFileName = process.env.NODE_ENV + '.conf.json';
        }
        else {
            // process.env serverMode
            //noinspection JSUnresolvedVariable
            process.env.NODE_ENV = serverMode;
        }
    }

    // load config file
    configFilePath = path.join(rootPath, 'config', configFileName);
    if (configFilePath !== path.join(rootPath, 'config', 'app.conf.json')) {
        if (fs.existsSync(configFilePath)) {
            console.log('load config file:' + configFilePath);
            tmp = require(configFilePath);

            // overwrite config properties with config file properties
            overwriteProperties(config, tmp);
        }
        else {
            console.log('config file: ' + configFilePath + ' not found');
            console.log('load config file: production.json');
            //noinspection JSUnresolvedVariable
            process.env.NODE_ENV = 'production';
        }
    }

    // extend config
    config.rootPath = rootPath;
    config.distPath = path.join(rootPath, 'dist');
    config.serverPath = path.join(rootPath, 'server');
    config.logPath = path.join(rootPath, 'server', 'logs');

    return  config;
};