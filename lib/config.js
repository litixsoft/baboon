module.exports = function (path, fs, basePath, logging) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var config = require(path.join(basePath, 'config', 'pro.json')),
        args = process.argv.splice(2),
        debug = [],
        warn = [],
        error = [],
        i,
        max,
        syslog,
        serverMode = 'production',
        configFileName = 'pro.json';

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
        if (args[0] === 'dev') {
            serverMode = 'development';
            configFileName = 'dev.json';
        }
        else if (args[0] === 'pro') {
            serverMode = 'production';
            configFileName = 'pro.json';
        }
        else {
            serverMode = args[0];
            configFileName = args[0] + '.json';
        }
    }

    // process.env serverMode
    //noinspection JSUnresolvedVariable
    process.env.NODE_ENV = serverMode;

    // load config file
    var filePath = path.join(basePath, 'config', configFileName);
    if (filePath !== path.join(basePath, 'config', 'pro.json')) {
        if (fs.existsSync(filePath)) {
            debug.push('use config file:' + filePath);
            var tmp = require(filePath);

            // overwrite config properties with config file properties
            overwriteProperties(config, tmp);
        }
        else {
            error.push('config file:' + filePath + 'not found');
            warn.push('use config file: production.json');
        }
    }

    // extend config
    config.basePath = basePath;
    config.publicPath = path.join(basePath, 'public');
    config.appPath = path.join(basePath, 'app');
    config.partialPath = path.join(basePath, 'views', 'partials');

    // setup logging
    //noinspection JSUnresolvedVariable
    logging.Init(config.logging);
    syslog = logging.syslog;

    // update logger
    for (i = 0, max = debug.length; i < max; i += 1) {
        syslog.debug(debug[i]);
    }

    for (i = 0, max = warn.length; i < max; i += 1) {
        syslog.warn(warn[i]);
    }

    for (i = 0, max = error.length; i < max; i += 1) {
        syslog.error(error[i]);
    }

    return  config;
};