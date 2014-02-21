'use strict';

module.exports = function () {
    var logging = function (msg) {
        console.log(msg);
    };

    var syslog = {
        debug: logging,
        info: logging,
        warn: logging,
        error: logging,
        fatal: logging
    };

    var trimConsole = function(msg) {
        return msg.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
    };

    var captureStream = function(stream) {
        var oldWrite = stream.write;
        var buf = '';
        stream.write = function(chunk ){
            buf += chunk.toString(); // chunk is a String or Buffer
            oldWrite.apply(stream, arguments);
        };

        return {
            unhook: function unhook(){
                stream.write = oldWrite;
            },
            captured: function(){
                return buf.split('\n');
            }
        };
    };

    return {
        logging: {
            syslog: syslog,
            audit: syslog
        },
        trimConsole: trimConsole,
        captureStream: captureStream
    };
};