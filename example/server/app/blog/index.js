(function(exports){
    'use strict';

    var socket,
        key,
        api = {};

    api.test = function (data, callback) {
        var end = new Date().toTimeString();
        var res = {fromClient: data, fromServer: end};
        callback(res);
    };

    exports.init = function(options) {
        socket = options.socket;
        key = options.key;

        socket.on(key + ':test', api.test);
    };

})(module.exports);