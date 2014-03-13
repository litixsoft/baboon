'use strict';

var path = require('path');

module.exports = function () {
    var logging = function (msg) {
        console.log(msg);
    };

    var syslog = {
        debug: logging,
        info: logging,
        warn: logging,
        error: logging,
        fatal: logging,
        isLevelEnabled: function () {
            return true;
        }
    };

    var trimConsole = function (msg) {
        return msg.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    };

    var captureStream = function (stream) {
        var oldWrite = stream.write;
        var buf = '';
        stream.write = function (chunk) {
            buf += chunk.toString(); // chunk is a String or Buffer
            oldWrite.apply(stream, arguments);
        };

        return {
            unhook: function unhook() {
                stream.write = oldWrite;
            },
            captured: function () {
                return buf.split('\n');
            }
        };
    };

    // result mock object
    var res = {
        statusCode: 200,
        header: '',
        data: {},
        setHeader: function (header) {
            res.header = header;
        },
        end: function (value) {
            res.data = value;
        },
        send: function (status, data) {
            return {
                status: status,
                data: data
            };
        },
        json: function (value) {
            return value;
        }
    };

    // request mock object
    var req = {
        body: {
            current: 'main',
            top: 'main'
        }
    };

    // socket
    var socket = {
        events:{},
        on: function (event, func) {
            socket.events[event] = func;
        }
    };

    // baboon object
    var baboon = {
        config: {
            useRightSystem: false,
            path: {
                modules: path.join(path.resolve('./test/mocks'), 'server', 'modules')
            }
        }
    };

    return {
        logging: {
            syslog: syslog,
            audit: syslog,
            express: syslog
        },
        trimConsole: trimConsole,
        captureStream: captureStream,
        res: res,
        req: req,
        socket: socket,
        baboon: baboon
    };
};