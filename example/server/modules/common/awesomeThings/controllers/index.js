'use strict';

module.exports = function() {

    var pub = {};

    /**
     * Gets all awesome things.
     *
     * @roles Guest
     * @description Gets all awesome things
     * @param {!Object} data The query.
     * @param {!Object} request The request object.
     * @param {!function(error, result)} callback The callback.
     */
    pub.getAll = function (data, request, callback) {
        callback(null, [
            {
                name: 'HTML5 Boilerplate',
                info: 'HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites.',
                awesomeness: 10
            },
            {
                name: 'AngularJS',
                info: 'AngularJS is a toolset for building the framework most suited to your application development.',
                awesomeness: 10
            },
            {
                name: 'Karma',
                info: 'Spectacular Test Runner for JavaScript.',
                awesomeness: 10
            },
            {
                name: 'Express',
                info: 'Flexible and minimalist web application framework for node.js.',
                awesomeness: 10
            },
            {
                name: 'Grunt',
                info: 'Flexible and minimalist web application framework for node.js.',
                awesomeness: 10
            }
        ]);
    };

    return pub;
};