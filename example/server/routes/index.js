'use strict';
var express = require('express');
var path = require('path');
var fs = require('fs');

/**
 * Returns all "routes.js" files in specified directory, including sub directory
 *
 * @param {String} pathName
 * @returns {Array}
 */
function getRouteFiles (pathName) {
    var items = fs.readdirSync(pathName);
    var files = [];

    items.forEach(function(itemName) {
        var fullName = path.join(pathName, itemName);
        var fsStat = fs.statSync(fullName);

        // If directory, then scan for "routes.js"
        if (fsStat.isDirectory()) {
            getRouteFiles(fullName).forEach(function(a) {
                files.push(a);
            })
        } else if (fsStat.isFile() && itemName === 'routes.js') {
            // routes.js found, append to list
            files.push(fullName)
        }
    });

    return files;
}

module.exports = function (baboon) {
    var router = express.Router();

    // Retrives all "routes.js" files in client/app folder and subfolder
    var clientAppPath = path.join(baboon.config.path.root, 'client', 'app');
    var clientRoutes = getRouteFiles(clientAppPath);

    // Require all routes
    clientRoutes.forEach(function(routeFile) {
        router = require(routeFile)(baboon, router);
    });

    return router;
};