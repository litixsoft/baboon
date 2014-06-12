'use strict';
module.exports = function () {
    return [
        {
            title: 'HOME',
            route: '/',
            controller: 'app/main/*',
            app: 'main',
            children: [
                {
                    title: 'LOCALE',
                    route: '/localization',
                    controller: 'app/main/locale/locale',
                    app: 'main'
                },
                {
                    title: 'ABOUT',
                    route: '/about',
                    controller: 'app/main/locale/locale',
                    app: 'main'
                },
                {
                    title: 'CONTACT',
                    route: '/contact',
                    app: 'main',
                    controller: 'app/main/contact/*',
                    children: [
                        {
                            title: 'EDIT',
                            route: '/contact/edit',
                            controller: 'app/main/contact/edit',
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
            controller: 'app/project1/project1',
            order: 2
        },
        {
            title: 'ADMIN',
            route: '/admin',
            app: 'admin',
            controller: 'app/admin/*',
            order: 4,
            children: [
                {
                    title: 'EDIT',
                    route: '/admin/edit',
                    controller: 'app/admin/edit/edit',
                    app: 'admin'
                }
            ]
        }
    ];
};