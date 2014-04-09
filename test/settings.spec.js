'use strict';

describe('Settings', function () {
    var path = require('path');
    var fs = require('fs');
    var rootPath = path.resolve(path.join(__dirname, '../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')))();
    var config = require(path.join(rootPath, 'lib', 'config'))(path.join(rootPath, 'test', 'mocks'), {config: 'unitTest'});
    var rights = require(path.join(rootPath, 'lib', 'rights'))(config, appMock.logging);
    var userRepo = require(path.join(rootPath, 'lib', 'repositories'))(config.rights.database).users;
    var testUser = {
        id: 77,
        name: 'wayne'
    };
    var request = {
        getSession: function (callback) {
            callback(null, {user: testUser});
        }
    };

    var sut = require(path.join(rootPath, 'lib', 'settings'))(config, appMock.logging, rights);
    var settingsFolder = path.join(config.path.appFolder, 'settings');

    beforeEach(function () {
        spyOn(appMock.logging.syslog, 'warn');
    });

    describe('with rights system enabled', function () {
        beforeEach(function (done) {
            config.rights.enabled = true;
            userRepo.remove({id: testUser.id}, done);
        });

        describe('setUserSetting()', function () {
            it('should return an error when the param user is wrong', function (done) {
                sut.setUserSetting(null, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "user" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param setting is no object', function (done) {
                sut.setUserSetting(testUser, null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param setting is missing or has no/wrong property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param setting has no property "key"', function (done) {
                sut.setUserSetting(testUser, {a: 1, value: 4}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param setting is missing or has no/wrong property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error there is a database error', function (done) {
                var rightsMock = require(path.join(rootPath, 'lib', 'rights'))(config, appMock.logging);
                rightsMock.getRepositories = function () {
                    return {
                        users: {
                            findOneById: function (id, options, ccc) {
                                ccc('error');
                            }
                        }
                    };
                };

                var sut2 = require(path.join(rootPath, 'lib', 'settings'))(config, appMock.logging, rightsMock);

                sut2.setUserSetting(testUser, {key: '1', value: 4}, function (err, res) {
                    expect(err).toBe('error');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an empty object when the user is not found in the db', function (done) {
                sut.setUserSetting({_id: '5280d688f9ce892133000001'}, {key: 'test', value: 1}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});

                    done();
                });
            });

            it('should save a user setting in the db', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSetting(user, {key: 'test', value: 1}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings.test).toBe(1);

                            done();
                        });
                    });
                });
            });
        });

        describe('setUserSettingFromRequest()', function () {
            it('should return an error when the param request is wrong', function (done) {
                sut.setUserSettingFromRequest(null, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param request has no function getSession()', function (done) {
                sut.setUserSettingFromRequest({}, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should save a user setting in the db', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettingFromRequest(request, {key: 'test', value: 1}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings.test).toBe(1);

                            done();
                        });
                    });
                });
            });
        });

        describe('setUserSettings()', function () {
            it('should return an error when the param user is wrong', function (done) {
                sut.setUserSettings(null, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "user" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param setting is no object', function (done) {
                sut.setUserSettings(testUser, null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param setting is missing');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should update nothing when the user is not found', function (done) {
                sut.setUserSettings({_id: '5280d688f9ce892133000001'}, {key: 'test', value: 1}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBe(0);

                    done();
                });
            });

            it('should save a user settings in the db', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings(user, {test: 1, wat: 'aa'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings).toEqual({test: 1, wat: 'aa'});

                            done();
                        });
                    });
                });
            });
        });

        describe('setUserSettingsFromRequest()', function () {
            it('should return an error when the param request is wrong', function (done) {
                sut.setUserSettingsFromRequest(null, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param request has no function getSession()', function (done) {
                sut.setUserSettingsFromRequest({}, {key: 'test', value: 1}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should save a user settings in the db', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettingsFromRequest(request, {test: 1, wat: 'aa'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings).toEqual({test: 1, wat: 'aa'});

                            done();
                        });
                    });
                });
            });
        });

        describe('getUserSettings()', function () {
            it('should return an error when the param user is wrong', function (done) {
                sut.getUserSettings(null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param "user" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an empty object when the user does not exists', function (done) {
                sut.getUserSettings(testUser, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});
                    expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                    expect(appMock.logging.syslog.warn.calls.length).toBe(1);

                    done();
                });
            });

            it('should return an empty object when the user has no settings yet', function (done) {
                sut.getUserSettings(testUser, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});

                    done();
                });
            });

            it('should return the settings of the user', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings(testUser, {color: 'blue', lines: 2}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        sut.getUserSettings(testUser, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toEqual({color: 'blue', lines: 2});

                            done();
                        });
                    });
                });
            });
        });

        describe('getUserSettingsFromRequest()', function () {
            it('should return an error when the param request is wrong', function (done) {
                sut.getUserSettingsFromRequest(null, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param request has no function getSession()', function (done) {
                sut.getUserSettingsFromRequest({}, function (err, res) {
                    expect(err instanceof TypeError).toBeTruthy();
                    expect(err.message).toBe('Param request is missing or has no function getSession()');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return the settings of the user', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings(testUser, {color: 'blue', lines: 3}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        sut.getUserSettingsFromRequest(request, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toEqual({color: 'blue', lines: 3});

                            done();
                        });
                    });
                });
            });
        });
    });

    describe('with rights system disabled', function () {
        beforeEach(function (done) {
            config.rights.enabled = false;

            fs.exists(config.path.appFolder, function (result) {
                if (!result) {
                    fs.mkdir(config.path.appFolder, done);
                } else {
                    done();
                }
            });
        });

        describe('setUserSetting()', function () {
            it('should save a user setting in the file system', function (done) {
                sut.setUserSetting(testUser, {key: 'test', value: 1}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBe(JSON.stringify({test: 1}));

                        done();
                    });
                });
            });
        });

        describe('setUserSettings()', function () {
            it('should save the user settings in the file system', function (done) {
                sut.setUserSettings(testUser, {test: 1, wat: 'aa'}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(JSON.stringify({test: 1, wat: 'aa'}));

                        done();
                    });
                });
            });

            it('should create the settings directory before saving a user settings in the file system', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                fs.unlinkSync(settingsFile);
                fs.rmdirSync(settingsFolder);

                sut.setUserSettings(testUser, {test: 1, wat: 'aa'}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFile), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(JSON.stringify({test: 1, wat: 'aa'}));

                        done();
                    });
                });
            });
        });

        describe('getUserSettings()', function () {
            it('should return an error when the setting files does not exists', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                fs.unlinkSync(settingsFile);
                fs.rmdirSync(settingsFolder);

                sut.getUserSettings(testUser, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({});

                    done();
                });
            });

            it('should return an empty object and log an error when the setting files cannot be parsed', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                sut.setUserSettings(testUser, {test: 1}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.writeFileSync(settingsFile, 'aaa,bbb');

                    sut.getUserSettings(testUser, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual({});

                        expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                        expect(appMock.logging.syslog.warn.calls.length).toBe(1);

                        done();
                    });
                });
            });

            it('should return the settings of the user', function (done) {
                sut.setUserSettings(testUser, {color: 'blue', lines: 2}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    sut.getUserSettings(testUser, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual({color: 'blue', lines: 2});

                        done();
                    });
                });
            });
        });
    });
});