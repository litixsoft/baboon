'use strict';

module.exports = function () {

    var pub = {};

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

    pub.raiseError = function (data, request, callback) {
        callback({message:'Error raised', stack:'Error stack'});
    };

    pub.raiseErrorWithStatus = function (data, request, callback) {
        callback({status: 300, message:'Error raised', stack:'Error stack'});
    };

    pub.sessionTest = function (data, request, callback) {
        request.getSession();
        request.setSession();

        request.getSession(function (error, session) {
            var a = 0;
            if (session) {
                a = session.a || 0;
                a++;
                session.a = a;
            }

            var items = [
                {name: 'a'},
                {name: 'b'},
                {name: 'c'}
            ];

            request.setSession(session, function () {
                callback(null, {items: items, count: items.length, sessionCalls: a});
            });
        });
    };

    return pub;
};