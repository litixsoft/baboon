'use strict';

/**
 * The app navigation
 *
 * @returns {*[]}
 */
module.exports = function () {

    return [
        {
            title: 'HOME',
            route: '/',
            roles: ['users'],
            app: 'main',
            children: [
                {
                    title: 'ABOUT',
                    route: '/about',
                    app: 'main'
                },
                {
                    title: 'CONTACT',
                    route: '/contact',
                    app: 'main'
                }
            ]
        },
        {
            title: 'ADMIN',
            route: '/admin',
            roles: ['admins'],
            app: 'admin',
        },
        {
            title: 'PROJECT1',
            route: '/project1',
            app: 'project1'
        }
    ];
};
