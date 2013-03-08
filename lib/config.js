module.exports = function (path, fs, basePath, log) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var config = require(path.join(basePath, 'config', 'base.json')),
        args = process.argv.splice(2),
        syslog = log.syslog,
        tmpConfig = {},
        debug = [],
        warn = [],
        error = [],
        i,
        max;

    /**
     * overwrite obj1 properties with obj2 properties
     * @param obj1
     * @param obj2
     */
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

    // check command line arguments
    if (args.length >= 2) {

        debug.push('setting application config:');

        for (i = 0, max = args.length; i < max; i += 2) {
            var key = args[i];
            var value = args[(i + 1)];

            if (key === '-c' || key === '--config') {
                debug.push('config:' + value);
                tmpConfig.config = value;
                continue;
            }

            if (key === '-s' || key === '--https') {
                debug.push('https:' + value);
                tmpConfig.https = value;
                continue;
            }

            if (key === '-p' || key === '--port') {
                debug.push('port:' + value);
                tmpConfig.port = value;
            }
        }
    }
    else {
        debug.push('no config parameters specified, use config file: base.json');
    }

    // overwrite config properties with command line arguments
    overwriteProperties(config, tmpConfig);

    // load config file
    var filePath = path.join(basePath, 'config', config.config + '.json');
    if (filePath !== path.join(basePath, 'config', 'base.json')) {
        if (fs.existsSync(filePath)) {
            debug.push('load config file:' + filePath);
            var tmp = require(filePath);

            // overwrite config properties with config file properties
            overwriteProperties(config, tmp);
        }
        else {
            error.push('config file:' + filePath + 'not found');
            warn.push('use config file: base.json');
        }
    }

    // extend config
    config.basePath = basePath;
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    config.publicPath = path.join(basePath, 'public');
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    config.appPath = path.join(basePath, 'app');
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable,JSCheckFunctionSignatures
    config.partialPath = path.join(basePath, 'views', 'partials');

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

    return config;
};
