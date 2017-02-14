/*global describe, it, expect, beforeEach */
'use strict';

var path = require('path'),
    rootPath = path.resolve(__dirname, '../', '../'),
    appMock = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
    repo = require(path.resolve(rootPath, 'lib', 'repositories'))(appMock.rights.database),
    sut = repo.users,
    data = null;

beforeEach(function (done) {
    // test data
    data = {
        name: 'wayne',
        email: 'wayne@wat.com',
        roles: [
            '5204cf825dd46a6c15000001'
        ],
        groups: [
            '5204cf825dd46a6c15000001'
        ],
        rights: [
            {
                _id: '5204cf825dd46a6c15000001',
                hasAccess: true
            }
        ],
        password: 'a',
        confirmed_password: 'a'
    };

    sut.remove({name: data.name}, function () {
        done();
    });
});

describe('Repositories/UsersRepositiory', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
        expect(typeof sut.checkName).toBe('function');
        expect(typeof sut.createUser).toBe('function');
    });

    describe('.validate()', function () {
        it('should validate the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('wayne');
                expect(data.email).toBe('wayne@wat.com');
                expect(data.roles[0].equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();
                expect(data.groups[0].equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();
                expect(data.rights[0]._id.equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();

                done();
            });
        });

        it('should validate the data when no options are specified', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('wayne');
                expect(data.email).toBe('wayne@wat.com');
                expect(data.roles[0].equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();
                expect(data.groups[0].equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();
                expect(data.rights[0]._id.equals(sut.convertId('5204cf825dd46a6c15000001'))).toBeTruthy();

                done();
            });
        });

        it('should validate to false when no data is given', function (done) {
            sut.validate(null, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(2);

                done();
            });
        });

        it('should validate to false when the data is not valid', function (done) {
            sut.validate({roles: ['1', '2']}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(4);
                expect(res.errors[0].property).toBe('email');
                expect(res.errors[0].attribute).toBe('required');
                expect(res.errors[1].property).toBe('roles.0');
                expect(res.errors[1].attribute).toBe('format');
                expect(res.errors[2].property).toBe('roles.1');
                expect(res.errors[2].attribute).toBe('format');
                expect(res.errors[3].property).toBe('name');
                expect(res.errors[3].attribute).toBe('required');

                done();
            });
        });

        it('should valid to false when the user name already exists in db', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);

                sut.insert(data, function (err, res) {
                    expect(err).toBeNull();
                    expect(res.length).toBe(1);

                    sut.validate({name: data.name}, {}, function (err, res) {
                        expect(res.valid).toBeFalsy();
                        expect(res.errors.length).toBe(2);
                        expect(res.errors[0].property).toBe('email');
                        expect(res.errors[0].attribute).toBe('required');
                        expect(res.errors[1].property).toBe('name');
                        expect(res.errors[1].attribute).toBe('checkName');

                        sut.validate({name: data.name, _id: '5204cf825dd46a6c15000001'}, {}, function (err, res) {
                            expect(res.valid).toBeFalsy();
                            expect(res.errors.length).toBe(2);
                            expect(res.errors[0].property).toBe('email');
                            expect(res.errors[0].attribute).toBe('required');
                            expect(res.errors[1].property).toBe('name');
                            expect(res.errors[1].attribute).toBe('checkName');

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('.checkName()', function () {
        it('should return valid = true when param "doc" is empty', function (done) {
            sut.checkName(null, function (err, res) {
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should check the name', function (done) {
            var doc = {
                name: 'wayne',
                _id: '5204cf825dd46a6c15000003'
            };

            sut.checkName(doc, function (err, res) {
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should mongodb to throw error', function (done) {
            var baseRepo = require('../../lib/lx-mongodb-core').BaseRepo({
                prepare: function (cb) {
                    cb(null, {
                        ensureIndex: function (n, cb) {
                            cb(null);
                        },
                        findOne: function (query, options, callback) {
                            return callback('error');
                        }
                    });
                }
            }, {});

            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['../lx-mongodb-core'] = {
                BaseRepo: function () {
                    return baseRepo;
                }
            };

            var repo = proxyquire(path.resolve(__dirname, '../', '../', 'lib', 'repositories', 'usersRepository'), stubs)({});


            var doc = {
                name: 'wayne',
                _id: '5204cf825dd46a6c15000003'
            };

            repo.checkName(doc, function (err) {
                expect(err).toBeDefined();

                done();
            });
        });
    });

    describe('.createUser()', function () {
        it('should create a user with password hash and salt', function (done) {
            var user = {name: 'wayne', password: 'a', salt: 'a'};

            sut.createUser(user, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();
                done();
            });
        });

        it('should create a user without any data', function (done) {
            sut.createUser(null, function (err, res) {
                expect(err).toBeNull();
                expect(res).toBeDefined();

                sut.remove({_id: res._id}, function () {
                    done();
                });
            });
        });

        it('should throw an error', function (done) {
            sut.createUser({$set: {_id: 1}}, function (error, result) {
                expect(error).toBeDefined();
                expect(result).not.toBeDefined();

                done();
            });
        });
    });

    describe('has a function getUserForLogin which', function () {
        var user = {name: 'wayne', password: 'hash', salt: 'salt'};

        beforeEach(function (done) {
            repo.users.insert(user, function () {
                done();
            });
        });

        afterEach(function (done) {
            repo.users.remove({name: user.name}, function () {
                done();
            });
        });

        it('should return the user with minimal data', function (done) {
            sut.getUserForLogin(user.name, function (error, result) {
                expect(error).toBeNull();
                expect(result.name).toBe('wayne');
                expect(result.password).toBe('hash');
                expect(result.salt).toBe('salt');

                done();
            });
        });

        it('should return an mongodb error', function (done) {
            sut.getUserForLogin({$set: {_id: 1}}, function (error, result) {
                expect(error).toBeDefined();
                expect(error.name).toBe('MongoError');
                expect(error.message).toContain('$set');
                expect(result).not.toBeDefined();

                done();
            });
        });
    });

    describe('has a function checkMail', function () {
        it('should return valid = true when param "doc" is empty', function (done) {
            sut.checkMail(null, function (err, res) {
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should return valid = true when param email has an invalid format', function (done) {
            sut.createUser(data, function () {
                sut.checkMail({email: 'wayne@wat.com', _id: '1104cf825dd46a6c15000003'}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res.valid).toBeFalsy();

                    done();
                });
            });
        });

        it('should check the mail', function (done) {
            var doc = {email: 'test@test.com', _id: '5204cf825dd46a6c15000003'};

            sut.checkName(doc, function (err, res) {
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should mongodb to throw error', function (done) {
            var baseRepo = require('../../lib/lx-mongodb-core').BaseRepo({
                prepare: function (cb) {
                    cb(null, {
                        ensureIndex: function (n, cb) {
                            cb(null);
                        },
                        findOne: function (query, options, callback) {
                            return callback('error');
                        }
                    });
                }
            }, {});

            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['../lx-mongodb-core'] = {
                BaseRepo: function () {
                    return baseRepo;
                }
            };

            var repo = proxyquire(path.resolve(__dirname, '../', '../', 'lib', 'repositories', 'usersRepository'), stubs)({});
            var doc = {email: 'wayne@wat.com', _id: '5204cf825dd46a6c15000003'};

            repo.checkMail(doc, function (err) {
                expect(err).toBeDefined();

                done();
            });
        });
    });
});