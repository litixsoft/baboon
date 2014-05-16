'use strict';

/*global describe, it, expect, beforeEach, spyOn */
describe('Rights', function () {
    var path = require('path'),
        rootPath = path.resolve(__dirname, '..'),
        lxHelpers = require('lx-helpers'),
        ObjectID = require('../node_modules/mongodb').ObjectID,
        RightsError = require(path.resolve(rootPath, 'lib', 'errors')).RightsError,
        appMock = require('./mocks/appMock')(),
        config = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
        sut = require(path.resolve(rootPath, 'lib', 'rights'))(config, appMock.logging),
        repo = require(path.resolve(rootPath, 'lib', 'repositories'))(config.rights.database),
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
                name: 'user',
                groups: [1]
            },
            {
                _id: 2,
                name: 'wayne',
                groups: [2, 5]
            },
            {
                _id: 3,
                name: 'devver',
                groups: [2, 4]
            },
            {
                _id: 4,
                name: 'chief',
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

    it('should throw an Error when not given params', function () {
        var func = function () {
            return require(path.resolve(rootPath, 'lib', 'rights'))();
        };
        expect(func).toThrow(new RightsError('Parameter config is required and must be a object type!'));
    });

    it('should throw an Error when not given param "logging"', function () {
        var func = function () {
            return require(path.resolve(rootPath, 'lib', 'rights'))({});
        };
        expect(func).toThrow(new RightsError('Parameter logging is required and must be a object type!'));
    });

    it('should not throw an Error when given params are of correct type', function () {
        var sut = require(path.resolve(rootPath, 'lib', 'rights'))({}, {});
        expect(sut).toBeDefined();
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.getRepositories).toBe('function');
        expect(typeof sut.userHasAccessTo).toBe('function');
        expect(typeof sut.userIsInRole).toBe('function');
        expect(typeof sut.getUserRights).toBe('function');
        expect(typeof sut.getUserAcl).toBe('function');
        expect(typeof sut.getAclObj).toBe('function');
        expect(typeof sut.secureNavigation).toBe('function');
        expect(typeof sut.getUser).toBe('function');
        expect(typeof sut.getExtendedAcl).toBe('function');
        expect(typeof sut.addResourceRight).toBe('function');
        expect(typeof sut.getPublicFunctionsFromControllers).toBe('function');
        expect(typeof sut.refreshRightsIdDb).toBe('function');
        expect(typeof sut.ensureThatDefaultSystemUsersExists).toBe('function');
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

            expect(func).toThrow(new RightsError('param "user" is not an object'));
        });

        it('should return false when the user has no acl', function () {
            var user = users[0];

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeFalsy();
        });

        it('should return true when the user has the role admin', function () {
            var user = users[0];
            user.rolesAsObjects = [
                {_id: 1, name: 'Admin'}
            ];

            expect(sut.userHasAccessTo(user, 'addTicket')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'someUnknownRight')).toBeTruthy();
        });

        it('should return true when the rights system is disabled', function () {
            var user = users[0];
            var sut1 = require(path.resolve(rootPath, 'lib', 'rights'))({rights:{enabled: false}}, {});

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

        it('should return true when the rights system is disabled', function () {
            var user = users[0];
            config.rights.enabled = false;

            expect(sut.userHasAccessTo(user, 'wayne')).toBeTruthy();

            config.rights.enabled = true;
        });
    });

    describe('.userIsInRole()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.userIsInRole('user', '123');};

            expect(func).toThrow(new RightsError('param "user" is not an object'));
        });

        it('should return false when the user has no roles', function () {
            var user = users[0];

            expect(sut.userIsInRole(user, 'admin')).toBeFalsy();
        });

        it('should return false when the user does not have the role', function () {
            var user = users[0];
            user.rolesAsObjects = [
                {_id: 1, name: 'admin'}
            ];

            expect(sut.userIsInRole(user, 'guest')).toBeFalsy();
        });

        it('should return true when the user has the role and the role is a mongo-id', function () {
            var user = users[0];
            user.rolesAsObjects = [
                {_id: new ObjectID('511106fc574d81d815000001'), name: 'admin'}
            ];

            expect(sut.userIsInRole(user, new ObjectID('511106fc574d81d815000001'))).toBeTruthy();
        });

        it('should return true when the user has the role and the role is a mongo-id string', function () {
            var user = users[0];
            user.rolesAsObjects = [
                {_id: new ObjectID('511106fc574d81d815000001'), name: 'admin'}
            ];

            expect(sut.userIsInRole(user, '511106fc574d81d815000001')).toBeTruthy();
        });

        it('should return true when the user has the role and the role is a mongo-id string', function () {
            var user = users[0];
            user.rolesAsObjects = [
                {_id: new ObjectID('511106fc574d81d815000001'), name: 'admin'}
            ];

            expect(sut.userIsInRole(user, 'admin')).toBeTruthy();
        });

        it('should return true when the rights system is disabled', function () {
            var user = users[0];
            config.rights.enabled = false;

            expect(sut.userIsInRole(user, 'wayne')).toBeTruthy();

            config.rights.enabled = true;
        });
    });

    describe('.getUserRights()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserRights('user', '123');};

            expect(func).toThrow(new RightsError('param "user" is not an object'));
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

        it('should add no rights', function () {
            var user = users[0];
            user.rights = [{name:'noAccess'}];
            user.roles = [5]; // Manager

            var res = sut.getUserRights(user, [], [], ['noRole']);

            expect(res.length).toBe(0);
        });
    });

    describe('.getUserAcl()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserAcl('user', '123');};

            expect(func).toThrow(new RightsError('param "user" is not an object'));
        });

        it('should return an empty object when the param "allRights" is empty', function () {
            var user = {
                    id: 0,
                    name: 'admin',
                    rights: [
                        {_id: 1, hasAccess: true}
                    ]
                },
                res = sut.getUserAcl(user);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an empty object when the user has no rights', function () {
            var user = {id: 0, name: 'admin'},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an empty object when the user has no rights and his groups have no rights', function () {
            var user = {id: 0, name: 'admin', groups: [1]},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return all rights when the user has the role "Admin"', function () {
            var user = {
                    id: 1,
                    name: 'admin',
                    rolesAsObjects: [
                        {_id: 1, name: 'Admin'}
                    ]
                },
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
            var testConfig = lxHelpers.clone(config);
            testConfig.rights.enabled = false;

            var sut1 = require(path.resolve(rootPath, 'lib', 'rights'))(testConfig, appMock.logging);

            sut1.getAclObj(null, function (err, res) {
                expect(err).toBeUndefined();
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

            expect(func).toThrow(new RightsError('param "user" is not an object'));
            expect(func1).toThrow(new RightsError('param "user" is not an object'));
            expect(func2).toThrow(new RightsError('param "user" is not an object'));
            expect(func3).toThrow(new RightsError('param "user" is not an object'));
            expect(func4).toThrow(new RightsError('param "user" is not an object'));
        });

        it('should throw an Exception when the param "navigation" is not of type array', function () {
            var func = function () { return sut.secureNavigation(users[0]);};
            var func1 = function () { return sut.secureNavigation(users[0], null);};
            var func2 = function () { return sut.secureNavigation(users[0], {});};
            var func3 = function () { return sut.secureNavigation(users[0], '');};
            var func4 = function () { return sut.secureNavigation(users[0], 123);};

            expect(func).toThrow(new RightsError('param "navigation" is not an array'));
            expect(func1).toThrow(new RightsError('param "navigation" is not an array'));
            expect(func2).toThrow(new RightsError('param "navigation" is not an array'));
            expect(func3).toThrow(new RightsError('param "navigation" is not an array'));
            expect(func4).toThrow(new RightsError('param "navigation" is not an array'));
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
//
//    describe('.getUser()', function () {
//        beforeEach(function (done) {
//            user = {
//                name: 'wayne',
//                hash: 'hash',
//                salt: 'salt'
//            };
//
//            repo.users.remove({name: user.name}, function () {
//                repo.rights.remove({name: {$in: ['add', 'save', 'delete']}}, function () {
//                    repo.roles.remove({name: 'dev'}, function () {
//                        repo.groups.remove({name: 'devs'}, function () {
//                            repo.resourceRights.remove({resource: 'a'}, function () {
//                                done();
//                            });
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should throw an error when the param "name" is not of type "string"', function () {
//            expect(function () { return sut.getUser(1); }).toThrow(new RightsError('param "name" is not a string'));
//        });
//
//        it('should throw an error when the param "callback" is not of type "function"', function () {
//            expect(function () { return sut.getUser(1); }).toThrow(new RightsError('param "callback" is not a function'));
//        });
//
//        it('should return the user with his rights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, res) {
//                expect(err).toBeNull();
//                expect(res.length).toBe(3);
//
//                user.rights = [
//                    {_id: res[0]._id, hasAccess: true},
//                    {_id: res[1]._id, hasAccess: false},
//                    {_id: res[2]._id, hasAccess: true}
//                ];
//
//                repo.users.insert(user, function (err, res) {
//                    expect(err).toBeNull();
//                    expect(res).toBeDefined();
//
//                    sut.getUser(user.name, function (err, res) {
//                        expect(err).toBeNull();
//                        expect(res).toBeDefined();
//                        expect(res.name).toBe('wayne');
//                        expect(res.hash).toBeUndefined();
//                        expect(res.salt).toBeUndefined();
//                        expect(res.acl).toBeDefined();
//                        expect(res.acl).toEqual({
//                            'add': {hasAccess: true},
//                            'delete': {hasAccess: true}
//                        });
//                        expect(res.rolesAsObjects.length).toBe(0);
//
//                        done();
//                    });
//                });
//            });
//        });
//
//        it('should return the an empty user object if the user does not exits', function (done) {
//            sut.getUser('123', function (err, res) {
//                expect(err).toBeNull();
//                expect(res).toEqual({});
//
//                done();
//            });
//        });
//
//        it('should return the user found by his id with his rights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, res) {
//                expect(err).toBeNull();
//                expect(res.length).toBe(3);
//
//                user.id = 99;
//                user.rights = [
//                    {_id: res[0]._id, hasAccess: true},
//                    {_id: res[1]._id, hasAccess: false},
//                    {_id: res[2]._id, hasAccess: true}
//                ];
//
//                repo.users.insert(user, function (err, res) {
//                    expect(err).toBeNull();
//                    expect(res).toBeDefined();
//
//                    sut.getUser(user.name, function (err, res) {
//                        expect(err).toBeNull();
//                        expect(res).toBeDefined();
//                        expect(res.name).toBe('wayne');
//                        expect(res.hash).toBeUndefined();
//                        expect(res.salt).toBeUndefined();
//                        expect(res.acl).toBeDefined();
//                        expect(res.acl).toEqual({
//                            'add': {hasAccess: true},
//                            'delete': {hasAccess: true}
//                        });
//
//                        done();
//                    });
//                });
//            });
//        });
//
//        it('should return the user with his rights and role rights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    user.roles = [roles[0]._id];
//
//                    repo.users.insert(user, function (err, users) {
//                        expect(err).toBeNull();
//                        expect(users).toBeDefined();
//
//                        sut.getUser(user.name, function (err, res) {
//                            expect(err).toBeNull();
//                            expect(res).toBeDefined();
//                            expect(res.name).toBe('wayne');
//                            expect(res.hash).toBeUndefined();
//                            expect(res.salt).toBeUndefined();
//                            expect(res.acl).toBeDefined();
//                            expect(res.acl).toEqual({
//                                'add': {hasAccess: true},
//                                'delete': {hasAccess: true}
//                            });
//                            expect(res.rolesAsObjects.length).toBe(1);
//                            expect(res.rolesAsObjects[0].name).toBe('dev');
//
//                            done();
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should return the user with his rights and group rights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
//                        expect(err).toBeNull();
//                        expect(groups).toBeDefined();
//
//                        user.groups = [groups[0]._id];
//
//                        repo.users.insert(user, function (err, users) {
//                            expect(err).toBeNull();
//                            expect(users).toBeDefined();
//
//                            sut.getUser(user.name, function (err, res) {
//                                expect(err).toBeNull();
//                                expect(res).toBeDefined();
//                                expect(res.name).toBe('wayne');
//                                expect(res.hash).toBeUndefined();
//                                expect(res.salt).toBeUndefined();
//                                expect(res.acl).toBeDefined();
//                                expect(res.acl).toEqual({
//                                    'add': {hasAccess: true},
//                                    'delete': {hasAccess: true}
//                                });
//                                expect(res.rolesAsObjects.length).toBe(1);
//                                expect(res.rolesAsObjects[0].name).toBe('dev');
//
//                                done();
//                            });
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should return the user with his rights and group rights and role rights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    user.roles = [roles[0]._id];
//
//                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
//                        expect(err).toBeNull();
//                        expect(groups).toBeDefined();
//
//                        user.groups = [groups[0]._id];
//
//                        repo.users.insert(user, function (err, users) {
//                            expect(err).toBeNull();
//                            expect(users).toBeDefined();
//
//                            sut.getUser(user.name, function (err, res) {
//                                expect(err).toBeNull();
//                                expect(res).toBeDefined();
//                                expect(res.name).toBe('wayne');
//                                expect(res.hash).toBeUndefined();
//                                expect(res.salt).toBeUndefined();
//                                expect(res.acl).toBeDefined();
//                                expect(res.acl).toEqual({
//                                    'add': {hasAccess: true},
//                                    'delete': {hasAccess: true}
//                                });
//                                expect(res.rolesAsObjects.length).toBe(1);
//                                expect(res.rolesAsObjects[0].name).toBe('dev');
//
//                                done();
//                            });
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should return the user with his rights and group rights and role rights and resourceRights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    user.roles = [roles[0]._id];
//
//                    repo.groups.insert({name: 'devs', roles: [roles[0]._id]}, function (err, groups) {
//                        expect(err).toBeNull();
//                        expect(groups).toBeDefined();
//
//                        user.groups = [groups[0]._id];
//
//                        repo.users.insert(user, function (err, users) {
//                            expect(err).toBeNull();
//                            expect(users).toBeDefined();
//
//                            sut.addResourceRight('a', {user_id: user._id, right_id: user.rights[0]._id}, function (err) {
//                                expect(err).toBeNull();
//                                expect(users).toBeDefined();
//
//                                sut.getUser(user.name, function (err, res) {
//                                    expect(err).toBeNull();
//                                    expect(res).toBeDefined();
//                                    expect(res.name).toBe('wayne');
//                                    expect(res.hash).toBeUndefined();
//                                    expect(res.salt).toBeUndefined();
//                                    expect(res.acl).toBeDefined();
//                                    expect(res.acl).toEqual({
//                                        'add': {hasAccess: true},
//                                        'delete': {hasAccess: true},
//                                        'save': {hasAccess: true, resource: 'a'}
//                                    });
//                                    expect(res.rolesAsObjects.length).toBe(1);
//                                    expect(res.rolesAsObjects[0].name).toBe('dev');
//
//                                    done();
//                                });
//                            });
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should return the user with his rights and group rights and role rights and resourceRights as acl', function (done) {
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    repo.groups.insert({name: 'devs'}, function (err, groups) {
//                        expect(err).toBeNull();
//                        expect(groups).toBeDefined();
//
//                        user.groups = [groups[0]._id];
//
//                        repo.users.insert(user, function (err, users) {
//                            expect(err).toBeNull();
//                            expect(users).toBeDefined();
//
//                            sut.addResourceRight('a', {group_id: groups[0]._id, role_id: roles[0]._id}, function (err) {
//                                expect(err).toBeNull();
//                                expect(users).toBeDefined();
//
//                                sut.getUser(user.name, function (err, res) {
//                                    expect(err).toBeNull();
//                                    expect(res).toBeDefined();
//                                    expect(res.name).toBe('wayne');
//                                    expect(res.hash).toBeUndefined();
//                                    expect(res.salt).toBeUndefined();
//                                    expect(res.acl).toBeDefined();
//                                    expect(res.acl).toEqual({
//                                        'add': {hasAccess: true, resource: 'a'},
//                                        'delete': {hasAccess: true, resource: 'a'},
//                                        'save': {hasAccess: true, resource: 'a'}
//                                    });
//                                    expect(res.rolesAsObjects.length).toBe(0);
//
//                                    done();
//                                });
//                            });
//                        });
//                    });
//                });
//            });
//        });
//
//        it('should mongodb to throw error', function (done) {
//            spyOn(console, 'log');
//
//            var proxyquire = require('proxyquire');
//            var repos = sut.getRepositories();
//            repos.roles.findOneById = function(a, callback){
//                callback('error');
//            };
//
//            var stubs = {};
//            stubs['./repositories'] = function(){
//                return repos;
//            };
//
//            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);
//
//            repo.rights.insert([
//                {name: 'add'},
//                {name: 'save'},
//                {name: 'delete'}
//            ], function (err, rights) {
//                expect(err).toBeNull();
//                expect(rights.length).toBe(3);
//
//                user.rights = [
//                    {_id: rights[1]._id, hasAccess: false}
//                ];
//
//                repo.roles.insert({name: 'dev', rights: [rights[0]._id, rights[1]._id, rights[2]._id]}, function (err, roles) {
//                    expect(err).toBeNull();
//                    expect(roles).toBeDefined();
//
//                    repo.groups.insert({name: 'devs'}, function (err, groups) {
//                        expect(err).toBeNull();
//                        expect(groups).toBeDefined();
//
//                        user.groups = [groups[0]._id];
//
//                        repo.users.insert(user, function (err, users) {
//                            expect(err).toBeNull();
//                            expect(users).toBeDefined();
//
//                            mock.addResourceRight('a', {group_id: groups[0]._id, role_id: roles[0]._id}, function (err) {
//                                expect(err).toBeNull();
//                                expect(users).toBeDefined();
//
//                                mock.getUser(user.name, function (err, res) {
//                                    expect(err).toBeDefined();
//                                    expect(res).toBeUndefined();
//
//                                    done();
//                                });
//                            });
//                        });
//                    });
//                });
//            });
//        });
//    });

    describe('.getExtendedAcl()', function () {
        beforeEach(function (done) {
            user = {
                name: 'wayne',
                hash: 'hash',
                salt: 'salt'
            };

            spyOn(console, 'log');

            repo.users.remove({name: user.name}, function () {
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
            expect(function () { return sut.getExtendedAcl({}, []); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], 1); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], '1'); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], null); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], undefined); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], true); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], {}); }).toThrow(new RightsError('param "callback" is not a function'));
            expect(function () { return sut.getExtendedAcl({}, [], []); }).toThrow(new RightsError('param "callback" is not a function'));
        });

        it('should throw an error when the param "user" is not of type "object"', function (done) {
            sut.getExtendedAcl([1], [1], function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
                expect(err.message).toContain('user');

                done();
            });
        });

        it('should throw an error when the param "additionalRoles" is not of type "array"', function (done) {
            sut.getExtendedAcl({1: 1}, {1: 1}, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
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

        it('should return an empty result when param "additionalRoles" has empty roles', function (done) {
            sut.getExtendedAcl(user, [1], function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();

                done();
            });
        });

        it('should return an empty result when param "additionalRoles" has empty roles but user has groups', function (done) {
            repo.groups.insert({name: 'devs'}, function (err, res) {
                user.rights = [1];
                user.roles = [1];
                user.groups = [res[0]._id];

                sut.getExtendedAcl(user, ['role'], function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeDefined();

                    done();
                });
            });
        });

        it('should mongodb to throw error', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['./repositories'] = function(){
                return {
                    roles:{
                        find: function(a,callback){
                            callback('error');
                        }
                    },
                    rights:{
                        find: function(a,callback){
                            callback('error');
                        }
                    },
                    groups:{
                        find: function(a,callback){
                            callback('error');
                        }
                    }
                };
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.getExtendedAcl(user, ['role'], function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });
    });

    describe('.addResourceRight()', function () {
        beforeEach(function (done) {
            repo.resourceRights.remove({resource: 'projectA'}, function () {done();});

            spyOn(console, 'log');
        });

        it('should throw an error when callback is not a function', function () {
            var func = function () { return sut.addResourceRight();};
            var func1 = function () { return sut.addResourceRight(1);};
            var func2 = function () { return sut.addResourceRight(1, {});};

            expect(func).toThrow(new RightsError('param "callback" is not a function'));
            expect(func1).toThrow(new RightsError('param "callback" is not a function'));
            expect(func2).toThrow(new RightsError('param "callback" is not a function'));
        });

        it('should return an error when options is not an object', function (done) {
            sut.addResourceRight(null, null, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
                expect(err.message).toContain('param "options" is not an object');

                done();
            });
        });

        it('should return an error when not resource or options is empty', function (done) {
            sut.addResourceRight(null, {}, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
                expect(err.message).toContain('missing param "resource" or param "options" is empty');

                done();
            });
        });

        it('should return an error when group_id and user_id are not in options', function (done) {
            sut.addResourceRight({}, {role_id: 1}, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
                expect(err.message).toContain('missing param "options.group_id" or missing param "options.user_id"');

                done();
            });
        });

        it('should return an error when role_id and right_id are not in options', function (done) {
            sut.addResourceRight({}, {group_id:1}, function (err) {
                expect(err).toBeDefined();
                expect(err instanceof RightsError).toBeTruthy();
                expect(err.message).toContain('missing param "options.role_id" or missing param "options.right_id"');

                done();
            });
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

        it('should mongodb to return null', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['./repositories'] = function(){
                return {
                    resourceRights:{
                        insert: function(a,callback){
                            callback(null, null);
                        }
                    }
                };
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.addResourceRight('projectA', {group_id: 1, role_id: 2}, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeNull();

                done();
            });
        });

        it('should mongodb to throw error', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['./repositories'] = function(){
                return {
                    resourceRights:{
                        insert: function(a,callback){
                            callback('error');
                        }
                    }
                };
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.addResourceRight('projectA', {group_id: 1, role_id: 2}, function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });
    });

    describe('.getPublicFunctionsFromControllers()', function () {
        it('should return an array with the full name of the rights', function () {
            sut.getPublicFunctionsFromControllers(function (err, res) {
                expect(err).toBeUndefined();
                expect(Array.isArray(res)).toBeTruthy();
                expect(res.length).toBeGreaterThan(0);
            });
        });

        it('should glob to throw error', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs.glob = function(a, callback){
                callback('error');
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.getPublicFunctionsFromControllers(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should fs to throw error', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs.fs = {
                readFile: function (a, b, callback) {
                    callback('error');
                }
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.getPublicFunctionsFromControllers(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toEqual([]);

                done();
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
                expect(err).toBeUndefined();
                expect(res).toBeDefined();
                expect(res).toBeGreaterThan(0);

                expect(appMock.logging.syslog.info).toHaveBeenCalled();
                expect(appMock.logging.syslog.info.calls.length).toBeGreaterThan(0);

                sut.refreshRightsIdDb(function (err, res) {
                    expect(err).toBeUndefined();
                    expect(res).toBeDefined();
                    expect(typeof res).toBe('number');

                    done();
                });
            });
        });

        it('should getPublicFunctionsFromControllers to throw error', function (done) {
            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs.glob = function(a, callback){
                callback('error');
            };

            var sut = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            sut.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should mongodb to throw error on rights.findOne', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.rights.findOne = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should mongodb to throw error on rights.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.rights.insert = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should mongodb to return null on rights.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.rights.insert = function(a, callback){
                callback(null, null);
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeUndefined();
                expect(res).toBe(0);

                done();
            });
        });

        it('should mongodb to throw error on rights.update', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.rights.findOne = function(a, callback){
                callback(null, {_id:1, description:'a'});
            };
            repos.rights.update = function(a, b, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBeUndefined();

                done();
            });
        });

        it('should mongodb to return null on rights.update', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.rights.findOne = function(a, callback){
                callback(null, {_id:1, description:'a'});
            };
            repos.rights.update = function(a, b, callback){
                callback(null, null);
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeUndefined();
                expect(res).toBe(0);

                done();
            });
        });

        it('should mongodb to throw error on roles.findOne', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.findOne = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(5);

                done();
            });
        });

        it('should mongodb to throw error on roles.update', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.findOne = function(a, callback){
                callback(null, {_id:1});
            };
            repos.roles.update = function(a, b, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(5);

                done();
            });
        });

        it('should mongodb to return null on roles.update', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.findOne = function(a, callback){
                callback(null, {_id:1});
            };
            repos.roles.update = function(a, b, callback){
                callback(null, null);
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeUndefined();
                expect(res).toBe(5);

                done();
            });
        });

        it('should mongodb to throw error on roles.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.insert = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(5);

                done();
            });
        });

        it('should mongodb to return null on roles.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.insert = function(a, callback){
                callback(null, null);
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.refreshRightsIdDb(function (err, res) {
                expect(err).toBeUndefined();
                expect(res).toBe(5);

                done();
            });
        });
    });

    describe('.ensureThatDefaultSystemUsersExists()', function () {
        beforeEach(function (done) {
            repo.users.remove({locked: true}, function () {
                done();
            });
        });

        it('should do nothing when rights system is disabled', function (done) {
            config.rights.enabled = false;
            var sut = require(path.resolve(rootPath, 'lib', 'rights'))(config, appMock.logging);

            sut.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeNull();
                expect(res).toBe(0);

                config.rights.enabled = true;

                done();
            });
        });

        it('should create system users in db if they do not exist', function (done) {
            sut.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeNull();
                expect(res).toBe(2);

                expect(appMock.logging.syslog.info).toHaveBeenCalled();
                expect(appMock.logging.syslog.info.calls.length).toBe(5);

                sut.ensureThatDefaultSystemUsersExists(function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBe(0);

                    done();
                });
            });
        });

        it('should mongodb to throw error on roles.findOne', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.roles.findOne = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(0);

                done();
            });
        });

        it('should mongodb to throw error on users.findOne', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.users.findOne = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(0);

                done();
            });
        });

//        it('should pwd to throw error', function (done) {
//            var proxyquire = require('proxyquire');
//
//            var stubs = {};
//            stubs.pwd = {
//                hash: function(password, callback){callback('error');}
//            };
//
//            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);
//
//            mock.ensureThatDefaultSystemUsersExists(function (err, res) {
//                expect(err).toBeDefined();
//                expect(res).toBe(0);
//
//                done();
//            });
//        });

        it('should mongodb to throw error on users.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.users.insert = function(a, callback){
                callback('error');
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeDefined();
                expect(res).toBe(0);

                done();
            });
        });

        it('should mongodb to return null on users.insert', function (done) {
            var proxyquire = require('proxyquire');
            var repos = sut.getRepositories();
            repos.users.insert = function(a, callback){
                callback(null, null);
            };

            var stubs = {};
            stubs['./repositories'] = function(){
                return repos;
            };

            var mock = proxyquire(path.resolve(rootPath, 'lib', 'rights'), stubs)(config, appMock.logging);

            mock.ensureThatDefaultSystemUsersExists(function (err, res) {
                expect(err).toBeNull();
                expect(res).toBe(0);

                done();
            });
        });
    });
});