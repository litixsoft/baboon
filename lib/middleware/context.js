'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (rights, config) {
    var pub = {};

//    var navi = [
//        {title: 'Home', route: '/home'},
//        {title: 'About', route: '/home/about'},
//        {title: 'Enterprise', route: '/enterprise', resource: 'example/enterprise/enterprise/getAll'},
//        {title: 'Blog', route: '/blog', resource: 'example/blog/blog/getAllPosts', children: [
//            {title: 'Admin', route: '/blog/admin', resource: 'example/blog/blog/createPost', children: [
//                {title: 'Demo1', route: '/demo1', icon: 'home'},
//                {title: 'Demo2', route: '/demo2', icon: 'gear'},
//                {title: 'Demo3', route: '/demo3', icon: 'home'}
//            ]}
//        ]},
//        {title: 'Cache', route: '/cache'},
//        {title: 'Admin', route: '/admin', children: [
//            {title: 'Users', route: '/admin/users', resource: 'baboon/admin/user/getAll'},
//            {title: 'Groups', route: '/admin/groups', resource: 'baboon/admin/group/getAll'},
//            {title: 'Rights', route: '/admin/rights', resource: 'baboon/admin/right/getAll'}
//        ]}
//    ];

    var navi = require(config.path.navigation);

    function getNav (nav, user) {
        var result = [];

        lxHelpers.forEach(nav, function (item) {
            var ii = lxHelpers.clone(item);

            if (item.children) {
                ii.children = getNav(item.children, user);
            }

            if (!item.hasOwnProperty('resource') || rights.userHasAccessTo(user, item.resource)) {
                delete ii.resource;
                result.push(ii);
            }
        });

        return result;
    }

    pub.index = function (req, res) {
        var isAuth = false,
            user = req.session.user,
            username = 'guest';

        if (typeof user !== 'undefined') {
            if (user.id !== -1) {
                isAuth = true;
            }

            username = user.name;
        }

        var nav = getNav(navi, user);

        req.session.nav = nav;

        res.locals.isAuth = isAuth;
        res.locals.username = username;
        res.locals.nav = nav;
        res.locals.aa = JSON.stringify(nav);
    };

    pub.login = function (req, res) {
        var err = req.session.error,
            msg = req.session.success;

        delete req.session.error;
        delete req.session.success;

        res.locals.showMsg = false;

        if (err) {
            res.locals.sessionMsgClass = 'loginError';
            res.locals.sessionMsg = err;
            res.locals.showMsg = true;
        }

        if (msg) {
            res.locals.sessionMsgClass = 'loginSuccess';
            res.locals.sessionMsg = msg;
            res.locals.showMsg = true;
        }
    };

    return pub;
};
