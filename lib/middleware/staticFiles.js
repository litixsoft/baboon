module.exports = function(dist) {
    'use strict';

    var path = require('path'),
        fs = require('fs'),
        pub = {};

    function sendFile(dist, pathname, res) {

        var filePath = path.join(dist, pathname);
        if (fs.existsSync(filePath)) {
            res.sendfile(filePath);
        }
        else {
            res.send(404);
        }
    }

    pub.send = function(req, res, next) {

        next = null;



    };

    return pub;
};
