/*global describe, it, expect, beforeEach, spyOn */
'use strict';

var appMock = require('../../../../../fixtures/serverMock.js')(),
    sut = require(appMock.config.path.modules + '/app/enterprise').enterprise(appMock),
    repo = require(appMock.config.path.modules + '/app/enterprise/repositories')(appMock.config.mongo.enterprise),
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
            sut.createMember({}, function (err) {
                expect(err).toBeDefined();
                expect(err.validation.length).toBe(1);

                sut.createMember(null, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(1);

                    done();
                });
            });
        });


        it('should create a new crew member', function (done) {
            sut.createMember(person, function (err, res) {
                expect(res).toBeDefined();
                expect(res.name).toBe(person.name);
                expect(res.description).toBe(person.description);

                expect(appMock.logging.audit.info).toHaveBeenCalled();
                expect(appMock.logging.audit.info.calls.length).toBe(1);
                expect(appMock.logging.syslog.error).wasNotCalled();

                done();
            });
        });
    });

    describe('has a function updateMember() which', function () {
        it('should return errors if the member is not valid', function (done) {
            sut.createMember(person, function (err, res) {
                res.name = '';

                sut.updateMember(res, function (err) {
                    expect(err).toBeDefined();
                    expect(err.validation.length).toBe(2);

                    sut.updateMember(null, function (err, res) {
                        expect(err).toBeUndefined();
                        expect(res).toBeUndefined();

                        done();
                    });
                });
            });
        });

        it('should update a member', function (done) {
            sut.createMember(person, function (err, res) {
                res.name = 'Worf';
                res.description = 'Security';
                var id = res._id.toHexString();
                res._id = id;

                sut.updateMember(res, function (err, res2) {
                    expect(res2).toBeDefined();
                    expect(res2).toBe(1);

                    expect(appMock.logging.audit.info).toHaveBeenCalled();
                    expect(appMock.logging.audit.info.calls.length).toBe(2);
                    expect(appMock.logging.syslog.error).wasNotCalled();

                    sut.getMemberById({id: id}, function (err, res3) {
                        expect(res3).toBeDefined();
                        expect(res3.name).toBe('Worf');
                        expect(res3.description).toBe('Security');

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
                    sut.getAllMembers({}, function (err, res) {
                        expect(res).toBeDefined();
                        expect(res.length).toBe(2);

                        done();
                    });
                });
            });
        });

        it('should return an error if the param "query" is no object', function (done) {
            sut.createMember(person, function () {
                sut.createMember({name: 'Worf', description: 'Security'}, function () {
                    sut.getAllMembers({params: 123}, function (err) {
                        expect(err).toBeDefined();
                        expect(err instanceof TypeError).toBeTruthy();
                        expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                        done();
                    });
                });
            });
        });
    });

    describe('has a function getMemberById() which', function () {
        it('should return a single member', function (done) {
            sut.createMember(person, function (err, res) {
                sut.getMemberById({id: res._id}, function (err, res2) {
                    expect(res2).toBeDefined();
                    expect(res2.name).toBe('Picard');
                    expect(res2.description).toBe('Captain');

                    done();
                });
            });
        });

        it('should return no member if id is empty', function (done) {
            sut.createMember(person, function () {
                sut.getMemberById({id: undefined}, function (err) {
                    expect(err).toBeDefined();
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                    done();
                });
            });
        });

        it('should return no member if data is empty', function (done) {
            sut.createMember(person, function () {
                sut.getMemberById(null, function (err) {
                    expect(err).toBeDefined();
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(appMock.logging.syslog.error).not.toHaveBeenCalled();

                    done();
                });
            });
        });
    });

    describe('has a function deleteMember() which', function () {
        it('should delete a member', function (done) {
            sut.createMember(person, function (err, res) {
                sut.deleteMember({id: res._id}, function (err, res) {
                    expect(res).toBe(1);

                    sut.getAllMembers({}, function (err, res) {
                        expect(res.length).toBe(0);
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
                sut.deleteMember(null, function (err, res) {
                    expect(res).toBe(0);
                    expect(err).toBeNull();

                    sut.getAllMembers({}, function (err, res) {
                        expect(res.length).toBe(1);
                        expect(appMock.logging.audit.info).toHaveBeenCalled();
                        expect(appMock.logging.audit.info.calls.length).toBe(2);

                        done();
                    });
                });
            });
        });
    });
});