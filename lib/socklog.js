var winston = require('winston');

var logger = new (winston.Logger)({
    transports : [new (winston.transports.Console)({
        json : false,
        timestamp : true
    }), new winston.transports.File({
        filename : __dirname + '/socket.log',
        json : true
    })],
    exceptionHandlers : [new (winston.transports.Console)({
        json : false,
        timestamp : true
    }), new winston.transports.File({
        filename : __dirname + '/socket-exceptions.log',
        json : false
    })],
    exitOnError : false
});

module.exports = logger;
