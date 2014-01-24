'use strict';

exports.captureStream = function(stream) {
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
exports.trimConsole = function(msg) {
    return msg.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
};