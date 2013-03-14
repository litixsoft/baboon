module.exports = function (path, fs, basePath, logging) {
    'use strict';

    //noinspection JSUnresolvedVariable
    var config = require(path.join(basePath, 'config', 'production.json')),
        args = process.argv.splice(2),
        debug = [],
        warn = [],
        error = [],
        i,
        max,
        syslogFile,
        auditFile,
        syslog;

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
    if (args.length === 1 && args[0] !== 'production') {
        // overwrite config properties with command line arguments
        overwriteProperties(config, {config: args[0]});
    }
    else if (args.length === 1 && args[0] === 'production') {
        debug.push('use production config.');
    }
    else {
        debug.push('no config parameters specified, use production config.');
    }

    // load config file
    var filePath = path.join(basePath, 'config', config.config + '.json');
    if (filePath !== path.join(basePath, 'config', 'production.json')) {
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
    config.logPath = path.join(basePath, 'logs');

    // logging
    syslogFile = path.join(config.logPath, 'sys.log');
    auditFile = path.join(config.logPath, 'audit.log');
    logging.SetupSyslog(config.logger.syslog.level, config.logger.syslog.transport, syslogFile);
    logging.SetupAudit(config.logger.audit.level, config.logger.audit.transport, auditFile);
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