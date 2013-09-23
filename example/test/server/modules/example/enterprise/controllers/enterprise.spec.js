/*global describe, it, expect, beforeEach, spyOn */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    sut = require(appMock.config.path.modules + '/example/enterprise').enterprise(appMock),
    repo = require(appMock.config.path.modules + '/example/enterprise/repositories')(appMock.config.mongo.enterprise),
    person = null;

beforeEach(function (done) {
    // clear db
    repo.crew.delete({}, function () {
        done();
    });

    spyOn(appMock.logging.audit, 'info');
    spyOn(appMock.logging.syslog, 'error');

    // test data
    person = {
        name: 'Picard',
        description: 'Captain'
    };
});

describe('Enterprise Controller', function () {
    it('should be initialized correctly', function () {
        expect(typeof sut.createMember).toBe('function');
    });

    describe('has a function createMember() which', function () {
        it('should return errors if the member is not valid (no data)', function (done) {
            sut.createMember({}, function (res) {
                expect(res).toBeDefined();
                expect(res.errors.length).toBe(1);

                sut.createMember(null, function (res) {
                    expect(res).toBeDefined();
                    expect(res.errors.length).toBe(1);

                    done();
                });
            });
        });


        it('should create a new crew member', function (done) {
            sut.createMember(person, function (res) {
                expect(res).toBeDefined();
                expect(res.data.name).toBe(person.name);
                expect(res.data.description).toBe(person.description);

                expect(appMock.logging.audit.info).toHaveBeenCalled();
                expect(appMock.logging.audit.info.calls.length).toBe(1);
                expect(appMock.logging.syslog.error).wasNotCalled();

                done();
            });
        });
    });

    describe('has a function updateMember() which', function () {
        it('should return errors if the member is not valid', function (done) {
            sut.createMember(person, function (res) {
                res.data.name = '';

                sut.updateMember(res.data, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.errors.length).toBe(2);

                    sut.updateMember(null, function (res3) {
                        expect(res3).toBeDefined();
                        expect(Object.keys(res3).length).toBe(0);

                        done();
                    });
                });
            });
        });

        it('should update a member', function (done) {
            sut.createMember(person, function (res) {
                res.data.name = 'Worf';
                res.data.description = 'Security';
                var id = res.data._id.toHexString();
                res.data._id = id;

                sut.updateMember(res.data, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.success).toBe(1);

                    expect(appMock.logging.audit.info).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(2);
                    expect(appMock.logging.syslog.error).wasNotCalled();

                    sut.getMemberById({id: id}, function (res3) {
                        expect(res3).toBeDefined();
                        expect(res3.data.name).toBe('Worf');
                        expect(res3.data.description).toBe('Security');

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getAllMembers() which', function () {
        it('should return all members', function (done) {
            sut.createMember(person, function () {
                sut.createMember({name: 'Worf', description: 'Security'}, function () {
                    sut.getAllMembers({}, function (res) {
                        expect(res).toBeDefined();
                        expect(res.data.length).toBe(2);

                        done();
                    });
                });
            });
        });

        it('should return an error if the param "query" is no object', function (done) {
            sut.createMember(person, function () {
                sut.createMember({name: 'Worf', description: 'Security'}, function () {
                    sut.getAllMembers({params: 123}, function (res) {
                        expect(res).toBeDefined();
                        expect(res.message).toBe('Could not load all members!');
                        expect(appMock.logging.syslog.error).toHaveBeenCalled();
                        expect(appMock.logging.syslog.error.calls.length).toBe(1);

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getMemberById() which', function () {
        it('should return a single member', function (done) {
            sut.createMember(person, function (res) {
                sut.getMemberById({id: res.data._id}, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.data.name).toBe('Picard');
                    expect(res2.data.description).toBe('Captain');

                    done();
                });
            });
        });

        it('should return no member if id is empty', function (done) {
            sut.createMember(person, function () {
                sut.getMemberById({id: undefined}, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.message).toBe('Could not load member!');
                    expect(appMock.logging.syslog.error).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(1);

                    done();
                });
            });
        });

        it('should return no member if data is empty', function (done) {
            sut.createMember(person, function () {
                sut.getMemberById(null, function (res2) {
                    expect(res2).toBeDefined();
                    expect(res2.message).toBe('Could not load member!');
                    expect(appMock.logging.syslog.error).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(1);

                    done();
                });
            });
        });
    });

    describe('has a function deleteMember() which', function () {
        it('should delete a member', function (done) {
            sut.createMember(person, function (res) {
                sut.deleteMember({id: res.data._id}, function (res) {
                    expect(res.success).toBe(1);

                    sut.getAllMembers({}, function (res) {
                        expect(res.data.length).toBe(0);
                        expect(appMock.logging.audit.info).toHaveBeenCalled();
                        expect(appMock.logging.audit.info.calls.length).toBe(2);
                        expect(appMock.logging.syslog.error).wasNotCalled();

                        done();
                    });
                });
            });
        });
        it('should delete nothing when the id is not specified', function (done) {
            sut.createMember(person, function () {
                sut.deleteMember(null, function (res) {
                    expect(res.data).toBeUndefined();
                    expect(res.message).toBeDefined();
                    expect(res.message).toBe('Could not delete member!');

                    sut.getAllMembers({}, function (res) {
                        expect(res.data.length).toBe(1);
                        expect(appMock.logging.audit.info).toHaveBeenCalled();
                        expect(appMock.logging.audit.info.calls.length).toBe(1);
                        expect(appMock.logging.syslog.error).toHaveBeenCalled();

                        done();
                    });
                });
            });
        });
    });
});