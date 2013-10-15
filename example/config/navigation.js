'use strict';

module.exports = [
    {title: 'APP_EXAMPLE', route: '/', target: '_self', children: [
        {title: 'HOME', route: '/home'},
        {title: 'ABOUT', route: '/home/about'},
        {title: 'ENTERPRISE', route: '/enterprise', right: 'example/enterprise/enterprise/getAllMembers'},
        {title: 'BLOG', route: '/blog', right: 'example/blog/blog/getAllPosts', children: [
            {title: 'ADMIN', route: '/blog/admin', right: 'example/blog/blog/createPost', children: [
                {title: 'Demo1', route: '/demo1', icon: 'home', target: '_self'},
                {title: 'Demo2', route: '/demo2', icon: 'gear'},
                {title: 'Demo3', route: '/demo3', icon: 'home'}
            ]}
        ]},
        {title: 'SESSION', route: '/session'},
        {title: 'TRANSLATION', route: '/translation'}
    ]},
    {'title': 'UI_EXAMPLE', 'route': '/ui', target: '_self', children: [
        {title: 'DEMO', route: '/demo'}
    ]},
    {'title': 'ADMINISTRATION', 'route': '/admin', target: '_self', right: 'baboon/admin/user/create', children: [
        {title: 'USERS', route: '/admin/users', right: 'baboon/admin/user/getAll'},
        {title: 'GROUPS', route: '/admin/groups', right: 'baboon/admin/group/getAll'},
        {title: 'ROLES', route: '/admin/roles', right: 'baboon/admin/role/getAll'},
        {title: 'RIGHTS', route: '/admin/rights', right: 'baboon/admin/right/getAll'}
    ]}
];