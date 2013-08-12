'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (sessionInactiveTime, sessionMaxLife) {
    var pub = {},
        guest = {id: -1, name: 'guest'},
        sessionProtectedKeys = ['user', 'cookie', 'activity', 'sessionID', 'socketID'];

    // todo refactor
    // give guest user all rights when testing e2e
    if (process.env.baboon === 'e2e') {
        guest.acl = {
            'example/blog/blog/getAllPosts': true,
            'example/blog/blog/getAllPostsWithCount': true,
            'example/blog/blog/searchPosts': true,
            'example/blog/blog/getPostById': true,
            'example/blog/blog/createPost': true,
            'example/blog/blog/updatePost': true,
            'example/blog/blog/addComment': true,
            'example/blog/blog/getAllTags': true,
            'example/blog/blog/createTag': true,
            'example/blog/blog/deleteTag': true,
            'example/enterprise/enterprise/getAll': true,
            'example/enterprise/enterprise/getById': true,
            'example/enterprise/enterprise/updateById': true,
            'example/enterprise/enterprise/create': true
        };
    }

    pub.checkSession = function (req, res, callback) {
        // check if session exists
        if (typeof req.session.user === 'undefined') {
            // session not exists, start new guest session
            req.session.user = guest;
            req.session.activity = new Date();
            req.session.start = new Date();

            callback({error: 1, message: 'session not exists, start new guest session'});
        } else {
            // check session activity time
            var activity = new Date(req.session.activity),
                start = new Date(req.session.start),
                end = new Date(),
                inactiveDifference = (end - activity) / 1000,
                maxDifference = (end - start) / 1000;

            // check activity time
            if (sessionInactiveTime < inactiveDifference || sessionMaxLife < maxDifference) {
                // to long inactive, regenerate session
                req.session.regenerate(function () {
                    req.session.user = guest;
                    req.session.activity = new Date();
                    req.session.start = new Date();

                    callback({error: 2, message: 'to long inactive or session expired, regenerate session'});
                });
            } else {
                // session ok, renewal activity time
                req.session.activity = new Date();

                callback(null);
            }
        }
    };

    // check session and set activity
    pub.setActivity = function (req, res) {
        pub.checkSession(req, res, function (err) {
            if (err) {
                if (err.error === 1 || err.error === 2) {
                    res.json(403, err.message);
                } else {
                    res.json(500, {'message': 'checkSession: unknown error'});
                }
            } else {
                res.json(200, {'message': 'new activity time was set'});
            }
        });
    };

    // get session data
    pub.getData = function (req, res) {
        var key = req.body.key;

        // check protected keys
        if (lxHelpers.arrayHasItem(sessionProtectedKeys, key)) {
            return res.json(403, {message: key + ' is protected'});
        }

        // check own key
        if (!req.session.hasOwnProperty(key)) {
            return res.json(403, {message: key + ' not found in session'});
        }

        var obj = {};
        obj[key] = req.session[key];

        return res.json(200, obj);
    };

    // set session data
    pub.setData = function (req, res) {
        var key = req.body.key,
            value = req.body.value;

        // check protected keys
        if (lxHelpers.arrayHasItem(sessionProtectedKeys, key)) {
            return res.json(403, {message: key + ' is protected'});
        }

        // save key value in session
        req.session[key] = value;

        return res.json(200, {message: key + ' is saved in session'});
    };

    return pub;
};
