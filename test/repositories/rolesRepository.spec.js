/*global describe, it, expect, beforeEach */
'use strict';

var path = require('path'),
    rootPath = path.resolve(__dirname, '../', '../'),
    appMock = require(path.resolve(rootPath, 'lib', 'config'))(path.resolve(rootPath, 'test', 'mocks'), {config: 'unitTest'}),
    repo = require(path.resolve(rootPath, 'lib', 'repositories'))(appMock.rights.database),
    sut = repo.roles,
    data = null;

beforeEach(function (done) {
    // test data
    data = {
        name: 'Admin',
        description: 'wayne',
        rights: [
            '5204cf825dd46a6c15000001',
            '5204cf825dd46a6c15000002'
        ]
    };

    sut.remove({name: data.name}, function () {done();});
});

describe('Repositories/RolesRepositiory', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.validate).toBe('function');
        expect(typeof sut.checkName).toBe('function');
    });

    describe('.validate()', function () {
        it('should validate the data', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('Admin');
                expect(data.description).toBe('wayne');
                expect(data.rights).toEqual([sut.convertId('5204cf825dd46a6c15000001'), sut.convertId('5204cf825dd46a6c15000002')]);

                done();
            });
        });

        it('should validate the data when no options are specified', function (done) {
            sut.validate(data, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.name).toBe('Admin');
                expect(data.description).toBe('wayne');
                expect(data.rights).toEqual([sut.convertId('5204cf825dd46a6c15000001'), sut.convertId('5204cf825dd46a6c15000002')]);

                done();
            });
        });

        it('should valid to false when no data is given', function (done) {
            sut.validate(null, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(1);

                done();
            });
        });

        it('should valid to false when the data is not valid', function (done) {
            sut.validate({rights: ['1', '2']}, null, function (err, res) {
                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(3);
                expect(res.errors[0].property).toBe('name');
                expect(res.errors[0].attribute).toBe('required');
                expect(res.errors[1].property).toBe('rights.0');
                expect(res.errors[1].attribute).toBe('format');
                expect(res.errors[2].property).toBe('rights.1');
                expect(res.errors[2].attribute).toBe('format');

                done();
            });
        });

        it('should valid to false when the role name already exists in db', function (done) {
            sut.validate(data, {}, function (err, res) {
                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);

                sut.insert(data, function (err, res) {
                    expect(err).toBeNull();
                    expect(res.length).toBe(1);

                    sut.validate({name: data.name}, {}, function (err, res) {
                        expect(res.valid).toBeFalsy();
                        expect(res.errors.length).toBe(1);
                        expect(res.errors[0].property).toBe('name');
                        expect(res.errors[0].attribute).toBe('Name');

                        sut.validate({name: data.name, _id: '5204cf825dd46a6c15000001'}, {}, function (err, res) {
                            expect(res.valid).toBeFalsy();
                            expect(res.errors.length).toBe(1);
                            expect(res.errors[0].property).toBe('name');
                            expect(res.errors[0].attribute).toBe('Name');

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('.checkName()', function () {
        it('should return valid = true when param "doc" is empty', function (done) {
            sut.checkName(null, function(err, res){
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should check the name', function (done) {
            var doc = {
                name:'Admin',
                _id:'5204cf825dd46a6c15000003'
            };

            sut.checkName(doc, function(err, res){
                expect(err).toBeNull();
                expect(res.valid).toBeTruthy();

                done();
            });
        });

        it('should mongodb to throw error', function (done) {
            var findOne = function(query, options, callback){return callback('error');};
            var baseRepo = require('lx-mongodb').BaseRepo({findOne: findOne}, {});

            var proxyquire = require('proxyquire');

            var stubs = {};
            stubs['lx-mongodb'] = {
                BaseRepo: function(){return baseRepo;}
            };

            var repo = proxyquire(path.resolve(__dirname, '../', '../', 'lib', 'repositories', 'rolesRepository'), stubs)({});


            var doc = {
                name:'Admin',
                _id:'5204cf825dd46a6c15000003'
            };

            repo.checkName(doc, function(err){
                expect(err).toBeDefined();

                done();
            });
        });
    });
});