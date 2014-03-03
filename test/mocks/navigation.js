'use strict';
module.exports = function () {
    return [
        {
            title: 'HOME',
            root: true,
            route: '/',
            roles: [
                'users'
            ],
            app: 'main',
            children: [
                {
                    title: 'LOCALE',
                    route: '/localization',
                    app: 'main'
                },
                {
                    title: 'ABOUT',
                    route: '/about',
                    app: 'main'
                },
                {
                    title: 'CONTACT',
                    route: '/contact',
                    app: 'main',
                    children: [
                        {
                            title: 'EDIT',
                            route: '/contact/edit',
                            app: 'main'
                        }
                    ]
                }
            ],
            order: '1'
        },
        {
            title: 'PROJECT1',
            route: '/project1',
            app: 'project1',
            order: 2
        },
        {
            title: 'ADMIN',
            route: '/admin',
            roles: [
                'admins'
            ],
            app: 'admin',
            order: 4
        }
    ];
};