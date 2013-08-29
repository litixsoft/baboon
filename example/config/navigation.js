'use strict';

module.exports = [
    {title: 'APP_EXAMPLE', route: '/', children: [
        {title: 'HOME', route: '/home'},
        {title: 'ABOUT', route: '/home/about'},
        {title: 'TRANSLATION', route: '/translation'},
        {title: 'SESSION', route: '/session'},
        {title: 'ENTERPRISE', route: '/enterprise', resource: 'example/enterprise/enterprise/getAll'},
        {title: 'BLOG', route: '/blog', resource: 'example/blog/blog/getAllPosts', children: [
            {title: 'ADMIN', route: '/blog/admin', resource: 'example/blog/blog/createPost', children: [
                {title: 'Demo1', route: '/demo1', icon: 'home'},
                {title: 'Demo2', route: '/demo2', icon: 'gear'},
                {title: 'Demo3', route: '/demo3', icon: 'home'}
            ]}
        ]},
        {title: 'Cache', route: '/cache'}
    ]},
    {'title': 'UI_EXAMPLE', 'route': '/ui', children: [
        {title: 'DEMO', route: '/demo'}
    ]},
    {'title': 'ADMINISTRATION', 'route': '/admin', resource: 'baboon/admin/user/create', children: [
        {title: 'USERS', route: '/admin/users', resource: 'baboon/admin/user/getAll'},
        {title: 'GROUPS', route: '/admin/groups', resource: 'baboon/admin/group/getAll'},
        {title: 'RIGHTS', route: '/admin/rights', resource: 'baboon/admin/right/getAll'}
    ]}
];