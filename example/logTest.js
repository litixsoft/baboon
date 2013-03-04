var winston = require('winston'),
    customLevels = {
        levels: {
            info: 0,
            debug: 1,
            warn: 2,
            error: 3
        },
        colors: {
            info: 'green',
            debug: 'cyan',
            warn: 'yellow',
            error: 'red'
        }
    },
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({colorize: true})
        ],
        levels: customLevels.levels,
        colors: customLevels.colors
    });

logger.info("127.0.0.1 - there's no place like home");
logger.debug("127.0.0.1 - there's no place like home");
logger.warn("127.0.0.1 - there's no place like home");
logger.error("127.0.0.1 - there's no place like home");