'use strict';

/*global describe, it, expect, beforeEach */
describe('Rights', function () {
    var path = require('path'),
        rootPath = path.resolve('..', 'baboon'),
        sut = require(path.resolve(rootPath, 'lib', 'rights')),
        users, groups, rights;

    beforeEach(function () {
        users = [
            {id: 1, name: 'admin'},
            {id: -1, name: 'guest'},
            {id: 2, name: 'wayne'}
        ];

        groups = [
            {_id: 1, name: 'admins'},
            {_id: -1, name: 'guests'},
            {_id: 2, name: 'devs'}
        ];

        rights = [
            {_id: 1, name: 'lx/admin/createUser'},
            {_id: 2, name: 'lx/admin/deleteUser'},
            {_id: 3, name: 'lx/admin/updateUser'},
            {_id: 4, name: 'lx/admin/readUser'},
            {_id: 5, name: 'lx/contacts/getAll'},
            {_id: 6, name: 'lx/contacts/create'},
            {_id: 7, name: 'lx/contacts/update'},
            {_id: 8, name: 'lx/contacts/delete'}
        ];
    });

    it('should be initialized correctly', function () {
        expect(typeof sut.getUserRights).toBe('function');
        expect(typeof sut.getUserAcl).toBe('function');
        expect(typeof sut.userHasAccessTo).toBe('function');
        expect(typeof sut.getAclObj).toBe('function');
        expect(typeof sut.data).toBe('function');
    });

    describe('.userHasAccessTo()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.userHasAccessTo('user', '123');};

            expect(func).toThrow();
        });

        it('should return false when the user has no acl', function () {
            var user = users[0];

            expect(sut.userHasAccessTo(user, 'lx/admin/createUser')).toBeFalsy();
        });

        it('should return false when the "param" rights is empty or not defined', function () {
            var user = users[0];

            expect(sut.userHasAccessTo(user)).toBeFalsy();
            expect(sut.userHasAccessTo(user, null)).toBeFalsy();
            expect(sut.userHasAccessTo(user, '')).toBeFalsy();
            expect(sut.userHasAccessTo(user, [])).toBeFalsy();
            expect(sut.userHasAccessTo(user, {})).toBeFalsy();
        });

        it('should return true when the user has the right', function () {
            var user = users[0],
                groups = [
                    {_id: 1, name: 'admins', rights: [1, 2]},
                    {_id: -1, name: 'guests', rights: [4]},
                    {_id: 2, name: 'devs', rights: [3, 5]}
                ];

            user.groups = [1, -1];
            user.rights = [
                {_id: 1, name: 'lx/admin/createUser', hasAccess: true},
                {_id: 2, name: 'lx/admin/deleteUser', hasAccess: false},
                {_id: 4, name: 'lx/admin/readUser', hasAccess: null},
                {_id: 5, name: 'lx/contacts/getAll', hasAccess: true}
            ];

            user.acl = sut.getUserAcl(user, rights, groups);

            expect(sut.userHasAccessTo(user, 'lx/admin/createUser')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'lx/admin/readUser')).toBeTruthy();
            expect(sut.userHasAccessTo(user, 'lx/admin/deleteUser')).toBeFalsy();
            expect(sut.userHasAccessTo(user, 'lx/contacts/getAll')).toBeTruthy();
        });
    });

    describe('.getUserRights()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserRights('user', '123');};

            expect(func).toThrow();
        });

        it('should add all rights from the groups of the user', function () {
            var user = users[0],
                groups = [
                    {_id: 1, name: 'admins', rights: [1, 2]},
                    {_id: -1, name: 'guests', rights: [4]},
                    {_id: 2, name: 'devs', rights: [3, 5]}
                ];

            user.groups = [1, -1];

            var res = sut.getUserRights(user, groups);

            expect(res.length).toBe(3);
            expect(res[0]).toEqual({_id: 1, hasAccess: true});
            expect(res[1]).toEqual({_id: 2, hasAccess: true});
            expect(res[2]).toEqual({_id: 4, hasAccess: true});
        });

        it('should add all rights from the groups of the user and overwrite with the user specific rights', function () {
            var user = users[0],
                groups = [
                    {_id: 1, name: 'admins', rights: [1, 2]},
                    {_id: -1, name: 'guests', rights: [4]},
                    {_id: 2, name: 'devs', rights: [3, 5]}
                ];

            user.groups = [1, -1];
            user.rights = [
                {_id: 1, name: 'lx/admin/createUser', hasAccess: true},
                {_id: 2, name: 'lx/admin/deleteUser', hasAccess: false},
                {_id: 4, name: 'lx/admin/readUser', hasAccess: null},
                {_id: 5, name: 'lx/contacts/getAll', hasAccess: true}
            ];

            var res = sut.getUserRights(user, groups);

            expect(res.length).toBe(4);
            expect(res[0]).toEqual({_id: 1, hasAccess: true});
            expect(res[1]).toEqual({_id: 2, hasAccess: false});
            expect(res[2]).toEqual({_id: 4, hasAccess: true});
            expect(res[3]).toEqual({_id: 5, hasAccess: true});
        });
    });

    describe('.getUserAcl()', function () {
        it('should throw an Error when the param "user" is of wrong type', function () {
            var func = function () { return sut.getUserAcl('user', '123');};

            expect(func).toThrow();
        });

        it('should return an empty object when the param "allRights" is empty', function () {
            var user = {
                    id: 1,
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
            var user = {id: 1, name: 'admin'},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an empty object when the user has no rights and his groups have no rights', function () {
            var user = {id: 1, name: 'admin', groups: [1]},
                res = sut.getUserAcl(user, rights);

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(0);
        });

        it('should return an array with the right names strings', function () {
            var user = {
                    id: 1,
                    name: 'admin',
                    rights: [
                        {_id: 1, hasAccess: true},
                        {_id: 2, hasAccess: false},
                        {_id: 3, hasAccess: true}
                    ]
                },
                res = sut.getUserAcl(user, rights),
                expected = {};

            expected[rights[0].name] = true;
            expected[rights[2].name] = true;

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(2);
            expect(res).toEqual(expected);
        });

        it('should return an array with the right names strings from user and his groups', function () {
            var user = users[0],
                groups = [
                    {_id: 1, name: 'admins', rights: [1, 2]},
                    {_id: -1, name: 'guests', rights: [4]},
                    {_id: 2, name: 'devs', rights: [3, 5]}
                ],
                expected = {};

            user.groups = [1, -1];
            user.rights = [
                {_id: 1, name: 'lx/admin/createUser', hasAccess: true},
                {_id: 2, name: 'lx/admin/deleteUser', hasAccess: false},
                {_id: 4, name: 'lx/admin/readUser', hasAccess: null},
                {_id: 5, name: 'lx/contacts/getAll', hasAccess: true}
            ];

            var res = sut.getUserAcl(user, rights, groups);

            expected[rights[0].name] = true;
            expected[rights[3].name] = true;
            expected[rights[4].name] = true;

            expect(typeof res).toBe('object');
            expect(Object.keys(res).length).toBe(3);
            expect(res).toEqual(expected);
        });
    });

    describe('getAclObj()', function () {
        it('should return an empty object if acl is empty or no object', function () {
            expect(Object.keys(sut.getAclObj()).length).toBe(0);
            expect(Object.keys(sut.getAclObj(null)).length).toBe(0);
            expect(Object.keys(sut.getAclObj(undefined)).length).toBe(0);
            expect(Object.keys(sut.getAclObj(1)).length).toBe(0);
            expect(Object.keys(sut.getAclObj('')).length).toBe(0);
            expect(Object.keys(sut.getAclObj(new Date())).length).toBe(0);
            expect(Object.keys(sut.getAclObj(true)).length).toBe(0);
        });

        it('should return an acl object', function () {
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

            var res = sut.getAclObj(acl);

            expect(res).toEqual({
                'example/blog': {
                    blog: ['getAllPosts', 'getAllPostsWithCount', 'searchPosts'],
                    admin: ['deletePosts']
                },
                'example/blog/calendar':{
                    month: ['getMonthName']
                },
                'example/enterprise': {
                    enterprise: ['getAll', 'getById']
                },
                'a/b/c/d/e': {
                    f: ['g']
                }
            });
        });

    });
});