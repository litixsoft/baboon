'use strict';

/*global describe, it, expect, beforeEach, spyOn */
describe('Rights', function () {
    var path = require('path'),
        lxHelpers = require('lx-helpers'),
        appMock = require('../../fixtures/appMock.js')(),
        rootPath = path.resolve('..', 'baboon'),
        sut = require(path.resolve(rootPath, 'lib', 'rights'))(appMock.config, appMock.logging),
        repo = require(path.resolve(rootPath, 'lib', 'repositories'))(appMock.config.mongo.rights),
        users, roles, rights, groups, projects, navigation, user;

    beforeEach(function () {
        spyOn(appMock.logging.syslog, 'info');

        rights = [
            {_id: 1, name: 'login'},
            {_id: 2, name: 'addUser'},
            {_id: 3, name: 'addProject'},
            {_id: 4, name: 'addTicket'},
            {_id: 5, name: 'addTime'},
            {_id: 6, name: 'addUserStory'},
            {_id: 7, name: 'addImprovement'}
        ];

        roles = [
            {
                _id: 1,
                name: 'admin',
                rights: [1, 2, 3]
            },
            {
                _id: 2,
                name: 'User',
                rights: [1]
            },
            {
                _id: 3,
                name: 'Reporter',
                rights: [1, 4]
            },
            {
                _id: 4,
                name: 'Developer',
                rights: [1, 4, 5, 6]
            },
            {
                _id: 5,
                name: 'Managers',
                rights: [1, 4, 5, 6, 7]
            }
        ];

        groups = [
            {
                _id: 1,
                name: 'Admins',
                roles: [2]
            },
            {
                _id: 2,
                name: 'Users',
                roles: [2]
            },
            {
                _id: 3,
                name: 'Reportes',
                roles: [2]
            },
            {
                _id: 4,
                name: 'Developers',
                roles: [2]
            },
            {
                _id: 5,
                name: 'Baboon',
                roles: [2]
            },
            {
                _id: 6,
                name: 'Managers',
                roles: [2]
            }
        ];

        users = [
            {
                _id: 1,
                username: 'user',
                groups: [1]
            },
            {
                _id: 2,
                username: 'wayne',
                groups: [2, 5]
            },
            {
                _id: 3,
                username: 'devver',
                groups: [2, 4]
            },
            {
                _id: 4,
                username: 'chief',
                groups: [2, 6]
            }
        ];

        projects = [
            {_id: 1, name: 'baboon'},
            {_id: 2, name: 'baboon-stack'},
            {_id: 3, name: 'lx-mongoDB'}
        ];

        navigation = [
            {title: 'APP_EXAMPLE', route: '/', children: [
                {title: 'HOME', route: '/home'},
                {title: 'ABOUT', route: '/home/about'},
                {title: 'LOGIN', route: '/login', right: 'login'}
            ]},
            {title: 'PROJECTS', route: '/admin', right: 'addTicket', children: [
                {title: 'USERS', route: '/admin/users', right: 'addUser'},
                {title: 'LIST', route: '/admin/groups'}
            ]}
        ];
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.getUserRights).toBe('function');
        expect(typeof sut.getUserAcl).toBe('function');
        expect(typeof sut.userHasAccessTo).toBe('function');
        expect(typeof sut.getAclObj).toBe('function');
    });

    describe('.getRepositories()', function () {
        it('should return the rights repository', function () {
            var res = sut.getRepositories();

            expect(res).toBeDefined();
            expect(res.users).toBeDefined();
            expect(res.rights).toBeDefined();
            expect(res.roles).toBeDefined();
            expect(res.groups).toBeDefined();
            expect(res.resourceRights).toBeDefined();
        });
    });

    describe('.userHasAccessTo()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.userHasAccessTo('user', '123');};

            expect(func).toThrow();
        });

        it('should return false when the user has no acl', function () {
            var user = users[0];

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeFalsy();
        });

        it('should return true when the user id is 1', function () {
            var user = users[0];
            user.id = 1;

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'someUnknownRight')).toBeTruthy();
        });

        it('should return true when the rights system is disabled', function () {
            var user = users[0];
            var sut1 = require(path.resolve(rootPath, 'lib', 'rights'))({useRightsSystem: false});

            expect(sut1.userHasAccessTo(user, 'addTicket')).toBeTruthy();
            expect(sut1.userHasAccessTo(user, 'someUnknownRight')).toBeTruthy();
        });

        it('should return false when the "param" right is empty or not defined', function () {
            var user = users[0];

            expect(sut.userHasAccessTo(user)).toBeFalsy();
            expect(sut.userHasAccessTo(user, null)).toBeFalsy();
            expect(sut.userHasAccessTo(user, '')).toBeFalsy();
            expect(sut.userHasAccessTo(user, [])).toBeFalsy();
            expect(sut.userHasAccessTo(user, {})).toBeFalsy();
        });

        it('should return true when the user has the right', function () {
            var user = users[0];
            user.roles = [5]; // Manager
            user.rights = [
                {_id: 1, hasAccess: false},
                {_id: 5, hasAccess: false}
            ]; // addTime

            user.acl = sut.getUserAcl(user, rights, roles, groups);

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addUserStory')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addImprovement')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'login')).toBeFalsy();
            expect(sut.userHasAccessTo(user, 'addUser')).toBeFalsy();
        });

        it('should return true when the user has the right and access to the resource', function () {
            var user = users[0];
            user.acl = sut.getUserAcl(user, rights, roles, groups, [roles[2]], [
                {right_id: 4, resource: 'baboon'},
                {right_id: 5, resource: 'baboon'}
            ]);

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addTicket', 'baboon')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addTicket', 'xxx')).toBeFalsy();
            expect(sut.userHasAccessTo(user, 'addTime')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addTime', 'baboon')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addTime', 'xxx')).toBeFalsy();
            expect(sut.userHasAccessTo(user, 'login')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'addUser')).toBeFalsy();
        });
    });

    describe('.getUserRights()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserRights('user', '123');};

            expect(func).toThrow();
        });

        it('should add all rights from the groups of the user', function () {
            groups[3].roles.push(roles[3]._id); // Developer

            var res = sut.getUserRights(users[0], roles, groups);
            var res2 = sut.getUserRights(users[2], roles, groups);

            expect(res.length).toBe(1);
            expect(res[0]).toEqual({_id: 1, hasAccess: true});
            expect(res2.length).toBe(4);
            expect(res2[0]).toEqual({_id: 1, hasAccess: true});
            expect(res2[1]).toEqual({_id: 4, hasAccess: true});
            expect(res2[2]).toEqual({_id: 5, hasAccess: true});
            expect(res2[3]).toEqual({_id: 6, hasAccess: true});
        });

        it('should add all rights from the roles/groups of the user and overwrite with the user specific rights', function () {
            var user = users[0];
            user.roles = [5]; // Manager
            user.rights = [
                {_id: 1, hasAccess: false},
                {_id: 5, hasAccess: false}
            ]; // addTime

            var res = sut.getUserRights(user, roles, groups);
            expect(res.length).toBe(5);
            expect(res[0]).toEqual({_id: 1, hasAccess: false});
            expect(res[1]).toEqual({_id: 4, hasAccess: true});
            expect(res[2]).toEqual({_id: 5, hasAccess: false});
            expect(res[3]).toEqual({_id: 6, hasAccess: true});
            expect(res[4]).toEqual({_id: 7, hasAccess: true});
        });

        it('should add all rights from the roles/groups of the user and add the rights of the additional roles', function () {
            var user = users[0];

            var res = sut.getUserRights(user, roles, groups, [roles[2]]); // additional role Reporter
            expect(res.length).toBe(2);
            expect(res[0]).toEqual({_id: 1, hasAccess: true});
            expect(res[1]).toEqual({_id: 4, hasAccess: true});
        });

        it('should add all rights from the roles/groups of the user and add the rights of the resourceRights', function () {
            var user = users[0];

            var res = sut.getUserRights(user, roles, groups, [roles[2]], [
                {right_id: 4, resource: 'baboon'},
                {right_id: 5, resource: 'baboon'}
            ]);

            expect(res.length).toBe(3);
            expect(res[0]).toEqual({_id: 1, hasAccess: true});
            expect(res[1]).toEqual({_id: 4, hasAccess: true, resource: 'baboon'});
            expect(res[2]).toEqual({_id: 5, hasAccess: true, resource: 'baboon'});
        });
    });

    describe('.getUserAcl()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserAcl('user', '123');};

            expect(func).toThrow();
        });

        it('should return an empty object when the param "allRights" is empty', function () {
            var user = {
                    id: 0,
                    username: 'admin',
                    rights: [
                        {_id: 1, hasAccess: true}
                    ]
                },
                res = sut.getUserAcl(user);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an empty object when the user has no rights', function () {
            var user = {id: 0, username: 'admin'},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an empty object when the user has no rights and his groups have no rights', function () {
            var user = {id: 0, username: 'admin', groups: [1]},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return all rights when the user id is 1', function () {
            var user = {id: 1, username: 'sysadmin'},
                res = sut.getUserAcl(user, rights, roles);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(7);
        });

        it('should return an array with the right names strings', function () {
            var user = users[0];
            user.roles = [5]; // Manager
            user.rights = [
                {_id: 1, hasAccess: false},
                {_id: 5, hasAccess: false}
            ]; // addTime

            var res = sut.getUserAcl(user, rights, roles, groups);

            expect(res).toEqual({
                'addTicket': {hasAccess: true},
                'addUserStory': {hasAccess: true},
                'addImprovement': {hasAccess: true}
            });
        });

        it('should return an array with the right names strings from user and his groups/roles and additional roles and resources', function () {
            var user = users[0];
            var res = sut.getUserAcl(user, rights, roles, groups, [roles[2]], [
                {right_id: 4, resource: 'baboon'},
                {right_id: 5, resource: 'baboon'}
            ]);

            expect(res).toEqual({
                'login': {hasAccess: true},
                'addTicket': {hasAccess: true, resource: 'baboon'},
                'addTime': {hasAccess: true, resource: 'baboon'}
            });
        });
    });

    describe('.getAclObj()', function () {
        it('should return an empty object if acl is empty or no object', function (done) {
            sut.getAclObj(undefined, function (err, res) {
                expect(err).toBeNull();
                expect(res).toEqual({});

                sut.getAclObj(null, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});

                    sut.getAclObj(1, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual({});

                        sut.getAclObj('', function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toEqual({});

                            sut.getAclObj(new Date(), function (err, res) {
                                expect(err).toBeNull();
                                expect(res).toEqual({});

                                sut.getAclObj(true, function (err, res) {
                                    expect(err).toBeNull();
                                    expect(res).toEqual({});

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should return an acl object', function (done) {
            var acl = {
                'example/blog/blog/getAllPosts': true,
                'example/blog/blog/getAllPostsWithCount': true,
                'example/blog/blog/searchPosts': true,
                'example/blog/admin/deletePosts': true,
                'example/blog/calendar/month/getMonthName': true,
                'example/enterprise/enterprise/getAll': true,
                'example/enterprise/enterprise/getById': true,
                'a/b/c/d/e/f/g': true
            };

            sut.getAclObj(acl, function (err, res) {
                expect(err).toBeNull();
                expect(res).toEqual({
                    'example/blog': {
                        blog: ['getAllPosts', 'getAllPostsWithCount', 'searchPosts'],
                        admin: ['deletePosts']
                    },
                    'example/blog/calendar': {
                        month: ['getMonthName']
                    },
                    'example/enterprise': {
                        enterprise: ['getAll', 'getById']
                    },
                    'a/b/c/d/e': {
                        f: ['g']
                    }
                });

                done();
            });
        });

        it('should return an acl object when the rights system is disabled', function (done) {
            var testConfig = lxHelpers.clone(appMock.config);
            testConfig.useRightsSystem = false;

            var sut1 = require(path.resolve(rootPath, 'lib', 'rights'))(testConfig, appMock.logging);

            sut1.getAclObj(null, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(typeof res).toBe('object');
                expect(Object.keys(res).length).toBeGreaterThan(0);

                done();
            });
        });
    });

    describe('.secureNavigation()', function () {
        it('should return an empty array when the navigation is an empty array', function () {
            expect(sut.secureNavigation(users[0], [])).toEqual([]);
        });

        it('should throw an Exception when the param "user" is not of type object', function () {
            var func = function () { return sut.secureNavigation('user');};
            var func1 = function () { return sut.secureNavigation([]);};
            var func2 = function () { return sut.secureNavigation(null);};
            var func3 = function () { return sut.secureNavigation(undefined);};
            var func4 = function () { return sut.secureNavigation(123);};

            expect(func).toThrow();
            expect(func1).toThrow();
            expect(func2).toThrow();
            expect(func3).toThrow();
            expect(func4).toThrow();
        });

        it('should throw an Exception when the param "navigation" is not of type array', function () {
            var func = function () { return sut.secureNavigation(users[0]);};
            var func1 = function () { return sut.secureNavigation(users[0], null);};
            var func2 = function () { return sut.secureNavigation(users[0], {});};
            var func3 = function () { return sut.secureNavigation(users[0], '');};
            var func4 = function () { return sut.secureNavigation(users[0], 123);};

            expect(func).toThrow();
            expect(func1).toThrow();
            expect(func2).toThrow();
            expect(func3).toThrow();
            expect(func4).toThrow();
        });

        it('should return the navigation array with the items the user has access to', function () {
            var user = users[0];
            user.acl = sut.getUserAcl(user, rights, roles, groups, [roles[2]], [
                {right_id: 4, resource: 'baboon'},
                {right_id: 5, resource: 'baboon'}
            ]);

            var res = sut.secureNavigation(user, navigation);

            expect(res).toEqual([
                {title: 'APP_EXAMPLE', route: '/', children: [
                    {title: 'HOME', route: '/home'},
                    {title: 'ABOUT', route: '/home/about'},
                    {title: 'LOGIN', route: '/login'}
                ]},
                {title: 'PROJECTS', route: '/admin', children: [
                    {title: 'LIST', route: '/admin/groups'}
                ]}
            ]);
        });

        it('should return the navigation array with the items the user has access to', function () {
            var user = users[0];
            user.roles = [1]; // Admin
            user.rights = [
                {_id: 1, hasAccess: false},
                {_id: 5, hasAccess: false}
            ];
            user.acl = sut.getUserAcl(user, rights, roles, groups);

            var res = sut.secureNavigation(user, navigation);

            expect(res).toEqual([
                {title: 'APP_EXAMPLE', route: '/', children: [
                    {title: 'HOME', route: '/home'},
                    {title: 'ABOUT', route: '/home/about'}
                ]}
            ]);
        });

        it('should return the navigation array with the items the user has access to', function () {
            var user = users[0];
            user.roles = [1, 4]; // Admin, Developer
            user.acl = sut.getUserAcl(user, rights, roles, groups);

            var res = sut.secureNavigation(user, navigation);

            expect(res).toEqual([
                {title: 'APP_EXAMPLE', route: '/', children: [
                    {title: 'HOME', route: '/home'},
                    {title: 'ABOUT', route: '/home/about'},
                    {title: 'LOGIN', route: '/login'}
                ]},
                {title: 'PROJECTS', route: '/admin', children: [
                    {title: 'USERS', route: '/admin/users'},
                    {title: 'LIST', route: '/admin/groups'}
                ]}
            ]);
        });
    });

    describe('.getUserForLogin()', function () {
        beforeEach(function (done) {
            user = {
                username: 'wayne',
                hash: 'hash',
                salt: 'salt'
            };

            repo.users.remove({username: user.username}, function () {done();});
        });

        it('should return the user with minimal data', function (done) {
            repo.users.insert(user, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();

                sut.getUserForLogin(user.username, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual(user);

                    done();
                });
            });
        });
    });

    describe('.getUser()', function () {
        beforeEach(function (done) {
            user = {
                username: 'wayne',
                hash: 'hash',
                salt: 'salt'
            };

            repo.users.remove({username: user.username}, function () {
                repo.rights.remove({name: {$in: ['add', 'save', 'delete']}}, function () {
                    repo.roles.remove({name: 'dev'}, function () {
                        repo.groups.remove({name: 'devs'}, function () {
                            repo.resourceRights.remove({resource: 'a'}, function () {
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should throw an error when the param "callback" is not of type "function"', function () {
            expect(function () { return sut.getUser(1); }).toThrow();
        });

        it('should return the user with his rights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(3);

                user.rights = [
                    {_id: res[0]._id, hasAccess: true},
                    {_id: res[1]._id, hasAccess: false},
                    {_id: res[2]._id, hasAccess: true}
                ];

                repo.users.insert(user, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();

                    sut.getUser(user._id, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeDefined();
                        expect(res.username).toBe('wayne');
                        expect(res.hash).toBeUndefined();
                        expect(res.salt).toBeUndefined();
                        expect(res.acl).toBeDefined();
                        expect(res.acl).toEqual({
                            'add': {hasAccess: true},
                            'delete': {hasAccess: true}
                        });

                        done();
                    });
                });
            });
        });

        it('should return the an empty user object if the user does not exits', function (done) {
            sut.getUser(123, function (err, res) {
                expect(err).toBeNull();
                expect(res).toEqual({});

                done();
            });
        });

        it('should return the user found by his id with his rights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, res) {
                expect(err).toBeNull();
                expect(res.length).toBe(3);

                user.id = 99;
                user.rights = [
                    {_id: res[0]._id, hasAccess: true},
                    {_id: res[1]._id, hasAccess: false},
                    {_id: res[2]._id, hasAccess: true}
                ];

                repo.users.insert(user, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();

                    sut.getUser(user.id, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeDefined();
                        expect(res.username).toBe('wayne');
                        expect(res.hash).toBeUndefined();
                        expect(res.salt).toBeUndefined();
                        expect(res.acl).toBeDefined();
                        expect(res.acl).toEqual({
                            'add': {hasAccess: true},
                            'delete': {hasAccess: true}
                        });

                        done();
                    });
                });
            });
        });

        it('should return the user with his rights and role rights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, rights) {
                expect(err).toBeNull();
                expect(rights.length).toBe(3);

                user.rights = [
                    {_id: rights[1]._id, hasAccess: false}
                ];

                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
                    expect(err).toBeNull();
                    expect(roles).toBeDefined();

                    user.roles = [roles[0]._id];

                    repo.users.insert(user, function (err, users) {
                        expect(err).toBeNull();
                        expect(users).toBeDefined();

                        sut.getUser(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toBeDefined();
                            expect(res.username).toBe('wayne');
                            expect(res.hash).toBeUndefined();
                            expect(res.salt).toBeUndefined();
                            expect(res.acl).toBeDefined();
                            expect(res.acl).toEqual({
                                'add': {hasAccess: true},
                                'delete': {hasAccess: true}
                            });

                            done();
                        });
                    });
                });
            });
        });

        it('should return the user with his rights and group rights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, rights) {
                expect(err).toBeNull();
                expect(rights.length).toBe(3);

                user.rights = [
                    {_id: rights[1]._id, hasAccess: false}
                ];

                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
                    expect(err).toBeNull();
                    expect(roles).toBeDefined();

                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
                        expect(err).toBeNull();
                        expect(groups).toBeDefined();

                        user.groups = [groups[0]._id];

                        repo.users.insert(user, function (err, users) {
                            expect(err).toBeNull();
                            expect(users).toBeDefined();

                            sut.getUser(user._id, function (err, res) {
                                expect(err).toBeNull();
                                expect(res).toBeDefined();
                                expect(res.username).toBe('wayne');
                                expect(res.hash).toBeUndefined();
                                expect(res.salt).toBeUndefined();
                                expect(res.acl).toBeDefined();
                                expect(res.acl).toEqual({
                                    'add': {hasAccess: true},
                                    'delete': {hasAccess: true}
                                });

                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should return the user with his rights and group rights and role rights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, rights) {
                expect(err).toBeNull();
                expect(rights.length).toBe(3);

                user.rights = [
                    {_id: rights[1]._id, hasAccess: false}
                ];

                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
                    expect(err).toBeNull();
                    expect(roles).toBeDefined();

                    user.roles = [roles[0]._id];

                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
                        expect(err).toBeNull();
                        expect(groups).toBeDefined();

                        user.groups = [groups[0]._id];

                        repo.users.insert(user, function (err, users) {
                            expect(err).toBeNull();
                            expect(users).toBeDefined();

                            sut.getUser(user._id, function (err, res) {
                                expect(err).toBeNull();
                                expect(res).toBeDefined();
                                expect(res.username).toBe('wayne');
                                expect(res.hash).toBeUndefined();
                                expect(res.salt).toBeUndefined();
                                expect(res.acl).toBeDefined();
                                expect(res.acl).toEqual({
                                    'add': {hasAccess: true},
                                    'delete': {hasAccess: true}
                                });

                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should return the user with his rights and group rights and role rights and resourceRights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, rights) {
                expect(err).toBeNull();
                expect(rights.length).toBe(3);

                user.rights = [
                    {_id: rights[1]._id, hasAccess: false}
                ];

                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
                    expect(err).toBeNull();
                    expect(roles).toBeDefined();

                    user.roles = [roles[0]._id];

                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
                        expect(err).toBeNull();
                        expect(groups).toBeDefined();

                        user.groups = [groups[0]._id];

                        repo.users.insert(user, function (err, users) {
                            expect(err).toBeNull();
                            expect(users).toBeDefined();

                            sut.addResourceRight('a', {user_id: user._id, right_id: user.rights[0]._id}, function (err) {
                                expect(err).toBeNull();
                                expect(users).toBeDefined();

                                sut.getUser(user._id, function (err, res) {
                                    expect(err).toBeNull();
                                    expect(res).toBeDefined();
                                    expect(res.username).toBe('wayne');
                                    expect(res.hash).toBeUndefined();
                                    expect(res.salt).toBeUndefined();
                                    expect(res.acl).toBeDefined();
                                    expect(res.acl).toEqual({
                                        'add': {hasAccess: true},
                                        'delete': {hasAccess: true},
                                        'save': {hasAccess: true, resource: 'a'}
                                    });

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it('should return the user with his rights and group rights and role rights and resourceRights as acl', function (done) {
            repo.rights.insert([
                {name: 'add'},
                {name: 'save'},
                {name: 'delete'}
            ], function (err, rights) {
                expect(err).toBeNull();
                expect(rights.length).toBe(3);

                user.rights = [
                    {_id: rights[1]._id, hasAccess: false}
                ];

                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
                    expect(err).toBeNull();
                    expect(roles).toBeDefined();

                    repo.groups.insert({name: 'devs'}, function (err, groups) {
                        expect(err).toBeNull();
                        expect(groups).toBeDefined();

                        user.groups = [groups[0]._id];

                        repo.users.insert(user, function (err, users) {
                            expect(err).toBeNull();
                            expect(users).toBeDefined();

                            sut.addResourceRight('a', {group_id: groups[0]._id, role_id: roles[0]._id}, function (err) {
                                expect(err).toBeNull();
                                expect(users).toBeDefined();

                                sut.getUser(user._id, function (err, res) {
                                    expect(err).toBeNull();
                                    expect(res).toBeDefined();
                                    expect(res.username).toBe('wayne');
                                    expect(res.hash).toBeUndefined();
                                    expect(res.salt).toBeUndefined();
                                    expect(res.acl).toBeDefined();
                                    expect(res.acl).toEqual({
                                        'add': {hasAccess: true, resource: 'a'},
                                        'delete': {hasAccess: true, resource: 'a'},
                                        'save': {hasAccess: true, resource: 'a'}
                                    });

                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    describe('.getExtendedAcl()', function () {
        beforeEach(function (done) {
            user = {
                username: 'wayne',
                hash: 'hash',
                salt: 'salt'
            };

            repo.users.remove({username: user.username}, function () {
                repo.rights.remove({name: {$in: ['add', 'save', 'delete']}}, function () {
                    repo.roles.remove({name: 'dev'}, function () {
                        repo.groups.remove({name: 'devs'}, function () {
                            repo.resourceRights.remove({resource: 'a'}, function () {
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('should throw an error when the param "callback" is not of type "function"', function () {
            expect(function () { return sut.getExtendedAcl({}, []); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], 1); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], '1'); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], null); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], undefined); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], true); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], {}); }).toThrow();
            expect(function () { return sut.getExtendedAcl({}, [], []); }).toThrow();
        });

        it('should throw an error when the param "user" is not of type "object"', function (done) {
            sut.getExtendedAcl([1], [1], function (err) {
                expect(err).toBeDefined();
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('user');

                done();
            });
        });

        it('should throw an error when the param "additionalRoles" is not of type "array"', function (done) {
            sut.getExtendedAcl({1: 1}, {1: 1}, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof TypeError).toBeTruthy();
                expect(err.message).toContain('additionalRoles');

                done();
            });
        });

        it('should return an empty callback when the params "user" or "additionalRoles" are empty', function (done) {
            sut.getExtendedAcl(1, 1, function (err, res) {
                expect(err).toBeUndefined();
                expect(res).toBeUndefined();

                done();
            });
        });
    });

    describe('.addResourceRight()', function () {
        beforeEach(function (done) {
            repo.resourceRights.remove({resource: 'projectA'}, function () {done();});
        });

        it('should throw an error when the params are missing', function () {
            var func = function () { return sut.addResourceRight();};
            var func1 = function () { return sut.addResourceRight(1);};
            var func2 = function () { return sut.addResourceRight(1, {});};
            var func3 = function () { return sut.addResourceRight(null, {}, function () {});};
            var func4 = function () { return sut.addResourceRight(1, {}, function () {});};
            var func5 = function () { return sut.addResourceRight(1, {group_id: 1}, function () {});};
            var func6 = function () { return sut.addResourceRight(1, {role_id: 1}, function () {});};
            var func7 = function () { return sut.addResourceRight(1, {user_id: 1}, function () {});};
            var func8 = function () { return sut.addResourceRight(1, {right_id: 1}, function () {});};

            expect(func).toThrow();
            expect(func1).toThrow();
            expect(func2).toThrow();
            expect(func3).toThrow();
            expect(func4).toThrow();
            expect(func5).toThrow();
            expect(func6).toThrow();
            expect(func7).toThrow();
            expect(func8).toThrow();
        });

        it('should add an resource right', function (done) {
            sut.addResourceRight('projectA', {group_id: 1, role_id: 2}, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res[0].resource).toBe('projectA');
                expect(res[0].group_id).toBe(1);
                expect(res[0].role_id).toBe(2);

                done();
            });
        });

    });

    describe('.getPublicFunctionsFromControllers()', function () {
        it('should return an array with the full name of the rights', function () {
            sut.getPublicFunctionsFromControllers(function (err, res) {
                expect(err).toBeNull();
                expect(Array.isArray(res)).toBeTruthy();
                expect(res.length).toBeGreaterThan(0);
            });
        });
    });

    describe('.refreshRightsIdDb()', function () {
        beforeEach(function (done) {
            repo.rights.remove({}, function () {
                repo.roles.remove({}, function () {
                    done();
                });
            });
        });

        it('should save all rights in the db', function (done) {
            sut.refreshRightsIdDb(function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                expect(res).toBeGreaterThan(0);

                expect(appMock.logging.syslog.info).toHaveBeenCalled();
                expect(appMock.logging.syslog.info.calls.length).toBeGreaterThan(0);

                sut.refreshRightsIdDb(function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();
                    expect(typeof res).toBe('number');

                    done();
                });
            });
        });
    });

    describe('.ensureThatDefaultSystemUsersExists()', function () {
        beforeEach(function (done) {
            repo.users.remove({locked: true}, function () {done();});
        });

        it('should create system users in db if they do not exist', function (done) {
            sut.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeNull();
                expect(res).toBe(3);

                expect(appMock.logging.syslog.info).toHaveBeenCalled();
                expect(appMock.logging.syslog.info.calls.length).toBe(3);

                sut.ensureThatDefaultSystemUsersExists(function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBe(0);

                    done();
                });
            });
        });
    });
});