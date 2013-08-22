'use strict';

module.exports = [
    {title: 'App Example', route: '/', children: [
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
        {title: 'Cache', route: '/cache'}
    ]},
    {'title': 'UI Example', 'route': '/ui', children: [
        {title: 'Demo', route: '/demo'}
    ]},
    {'title': 'Administration', 'route': '/admin', children: [
        {title: 'Users', route: '/admin/users', resource: 'baboon/admin/user/getAll'},
        {title: 'Groups', route: '/admin/groups', resource: 'baboon/admin/group/getAll'},
        {title: 'Rights', route: '/admin/rights', resource: 'baboon/admin/right/getAll'}
    ]},
    {'title': 'Dokumentation', 'route': '/doc', children: [
        {title:'Baboon Installation',route:'/doc/md/first'},
        {title:'Baboon Dingens',route:'/doc/md/second'},
        {title:'Baboon Super',route:'/doc/md/third',children:[
            {title:'Super Doll',route:'/doc/md/quad',children:[
                {title:'Doll 1',route:'/doc/md/five',icon:'home'},
                {title:'Doll 2',route:'/doc/md/six',icon:'gear'},
                {title:'Doll 3',route:'/doc/md/seven',icon:'home'}]
            }]
        },
        {title:'Baboon Toll',route:'/doc/md/eight'}
    ]}
];