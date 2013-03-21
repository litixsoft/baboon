module.exports = function (path, fs, basePath) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var config = require(path.join(basePath, 'config', 'production.json')),
        args = process.argv.splice(2),
        tmp,
        configFilePath,
        serverMode = 'production',
        configFileName = 'production.json';

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
        configFileName = args[0] + '.json';

        // process.env serverMode
        //noinspection JSUnresolvedVariable
        process.env.NODE_ENV = serverMode;
    }
    else {
        //noinspection JSUnresolvedVariable
        if (typeof process.env.NODE_ENV !== 'undefined') {
            //noinspection JSUnresolvedVariable
            configFileName = process.env.NODE_ENV + '.json';
        }
        else {
            // process.env serverMode
            //noinspection JSUnresolvedVariable
            process.env.NODE_ENV = serverMode;
        }
    }

    // load config file
    configFilePath = path.join(basePath, 'config', configFileName);
    if (configFilePath !== path.join(basePath, 'config', 'production.json')) {
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
    config.basePath = basePath;
    config.publicPath = path.join(basePath, 'public');
    config.appPath = path.join(basePath, 'app');
    config.partialPath = path.join(basePath, 'views', 'partials');

    return  config;
};