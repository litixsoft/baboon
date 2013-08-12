'use strict';

module.exports = [
    {title: 'Home', route: '/home'},
    {title: 'About', route: '/home/about'},
    {title: 'Enterprise', route: '/enterprise', resource: 'example/enterprise/enterprise/getAll'},
    {title: 'Blog', route: '/blog', resource: 'example/blog/blog/getAllPosts', children: [
        {title: 'Admin', route: '/blog/admin', resource: 'example/blog/blog/createPost', children: [
            {title: 'Demo1', route: '/demo1', icon: 'home'},
            {title: 'Demo2', route: '/demo2', icon: 'gear'},
            {title: 'Demo3', route: '/demo3', icon: 'home'}
        ]}
    ]},
    {title: 'Cache', route: '/cache'},
    {title: 'Admin', route: '/admin', children: [
        {title: 'Users', route: '/admin/users', resource: 'baboon/admin/user/getAll'},
        {title: 'Groups', route: '/admin/groups', resource: 'baboon/admin/group/getAll'},
        {title: 'Rights', route: '/admin/rights', resource: 'baboon/admin/right/getAll'}
    ]}
];