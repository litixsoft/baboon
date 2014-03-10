'use strict';

// must be moved in controller
var awesomeThings = function (data, request, callback) {
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
        }
    ]);
};

/**
 * Configure the api routes
 *
 * @param app
 * @param baboon
 */
module.exports = function() {
    return {
        awesomeThings: awesomeThings
    };

//    // Middleware navigation
//    var navigation = baboon.navigation;
//
//    // Api Routes
//    app.get('/api/awesomeThings', awesomeThings);
//
//    // Navigation Api
//    app.post('/api/navigation/getSubList', navigation.getSubList);
//    app.post('/api/navigation/getSubTree', navigation.getSubTree);
//    app.post('/api/navigation/getTopList', navigation.getTopList);
//    app.post('/api/navigation/getList', navigation.getList);
//    app.post('/api/navigation/getTree', navigation.getTree);
};