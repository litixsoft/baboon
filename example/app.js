'use strict';
//noinspection JSUnresolvedVariable
var path = require('path'),
    baboon = require('../lib/baboon')(path.join(__dirname)),
    middleware = baboon.middleware,
    server = baboon.server,
    app = server.app;
//    config = baboon.config;
//    api = require(config.path.api);

///////////////////////////////////////////
// extra routess
///////////////////////////////////////////

// toplevel ui_examples route
app.get('/ui', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('ui');
    });
});

app.get('/ui/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('ui');
    });
});

// toplevel admin routes
app.get('/admin', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin');
    });
});

// test
app.get('/admin/startAdministration', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        var async = require('async'),
            lxHelpers = require('lx-helpers'),
            repos = baboon.rights.getRepositories();

        async.auto({
            getGroup: function(next) {
                repos.groups.getOne({name: 'Admin'}, next);
            },
            getAllRights: function (next) {
                repos.rights.getAll(next);
            },
            getUserGroups: function (next, results) {
                if (lxHelpers.isEmpty(req.session.user.groups)) {
                    next(null, []);
                } else {
                    repos.groups.getAll({_id: {$in: results.getUser.groups}}, next);
                }
            },
            getAcl: ['getGroup', 'getAllRights', 'getUserGroups', function(next, results) {
                if (results.getGroup) {
                    console.log('before:');
                    console.log(req.session.user.acl);

                    req.session.user.acl = baboon.rights.getUserAcl(req.session.user, results.getAllRights, results.getUserGroups, [results.getGroup]);

                    console.log('after:');
                    console.log(req.session.user.acl);

                    var navigation = baboon.config.path.navigation ? require(baboon.config.path.navigation) : null,
                        userNavigation = baboon.rights.secureNavigation(req.session.user, navigation),
                        topLevelNavigation = [];

                    // extract top level navigation links
                    lxHelpers.forEach(userNavigation, function(navItem) {
                        var topLevelLink = lxHelpers.clone(navItem);
                        delete topLevelLink.children;

                        topLevelNavigation.push(topLevelLink);
                    });

                    // save navigation in session
                    req.session.navigation = userNavigation;

                    res.locals.isAuth = true;
                    res.locals.username = req.session.user.name;
                    res.locals.navigation = userNavigation;
                    res.locals.topLevelNavigation = topLevelNavigation;

                    res.render('admin');
                }
            }]
        }, function (err, res) {
            if (err) {
                baboon.logging.syslog.error(err);
            }
        });

//        res.json(200, {data: req.body.project_id});
    });

});

app.get('/admin/*', function (req, res) {
    middleware.session.checkSession(req, res, function () {
        middleware.context.index(req, res);
        res.render('admin');
    });
});

///////////////////////////////////////////
// api
///////////////////////////////////////////

// enable socket.io api
//api.socket(baboon);

///////////////////////////////////////////
// server
///////////////////////////////////////////

// start express server
server.start();