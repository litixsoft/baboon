'use strict';

module.exports = [
    {title: 'App Example', route: '/', children: [
        {title: 'Home', route: '/home'},
        {title: 'About', route: '/home/about'},
        {title: 'Translation', route: '/translation'},
        {title: 'Sessions', route: '/session'},
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
        {title:'Startseite',route:'/doc'},
        {title:'Baboon First',route:'/doc/md/first'},
        {title:'Baboon Second',route:'/doc/md/second'},
        {title:'Baboon Third',route:'/doc/md/third',children:[
            {title:'Fourth',route:'/doc/md/fourth',children:[
                {title:'Five',route:'/doc/md/five',icon:'home'},
                {title:'Six',route:'/doc/md/six',icon:'gear'},
                {title:'Seven',route:'/doc/md/seven',icon:'home'}]
            }]
        },
        {title:'Baboon Eight',route:'/doc/md/eight'}
    ]}
];