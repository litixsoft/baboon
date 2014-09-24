'use strict';

describe('Settings', function () {
    var path = require('path');
    var fs = require('fs');
    var lxHelpers = require('lx-helpers');
    var rootPath = path.resolve(path.join(__dirname, '../'));
    var appMock = require(path.resolve(path.join(rootPath, 'test', 'mocks', 'appMock')))();
    var config = require(path.join(rootPath, 'lib', 'config'))(path.join(rootPath, 'test', 'mocks'), {config: 'unitTest'});
    var rights = require(path.join(rootPath, 'lib', 'rights'))({config: config, loggers: appMock.logging});
    var userRepo = require(path.join(rootPath, 'lib', 'repositories'))(config.rights.database).users;
    var SettingsError = require('../lib/errors').SettingsError;
    var ValidationError = require('../lib/errors').ValidationError;
    var testUser = {
        id: 77,
        name: 'wayne'
    };
    var sessionForGuestUser = {
        session: {
            user: {
                name: 'guest'
            }
        }
    };
    var sut = require(path.join(rootPath, 'lib', 'settings'))({config: config, loggers: appMock.logging, rights: rights});
    var settingsFolder = path.join(config.path.appFolder, 'config');

    beforeEach(function () {
        spyOn(appMock.logging.syslog, 'warn');
        spyOn(appMock.logging.syslog, 'error');
    });

    it('should log an error when the default client settings file cannot be parsed', function () {
        var configMock = lxHelpers.clone(config);
        configMock.path.root = path.join(config.path.root, 'config');

        require(path.join(rootPath, 'lib', 'settings'))({config: configMock, loggers: appMock.logging, rights: rights});

        expect(appMock.logging.syslog.warn).toHaveBeenCalled();
        expect(appMock.logging.syslog.warn.calls.length).toBe(1);
        expect(appMock.logging.syslog.warn.mostRecentCall.args[0]).toEqual('settings: Cannot parse default client settings file: %s');
        expect(appMock.logging.syslog.warn.mostRecentCall.args[1]).toEqual(path.join(configMock.path.root, 'client_settings.js'));
    });

    it('should log no warning when the default client settings files not exists', function (done) {
        var configMock = lxHelpers.clone(config);
        configMock.path.root = path.join(config.path.root, '123');

        var sut2 = require(path.join(rootPath, 'lib', 'settings'))({config: configMock, loggers: appMock.logging, rights: rights});

        expect(appMock.logging.syslog.warn).not.toHaveBeenCalled();

        sut2.setUserSettings({language: 'fr-fr'}, {session: {user: testUser}}, function () {
            done();
        });
    });

    describe('with rights system enabled', function () {
        beforeEach(function (done) {
            config.rights.enabled = true;
            userRepo.remove({id: testUser.id}, done);
        });

        describe('setUserSetting()', function () {
            it('should return an error when the param session is wrong', function (done) {
                sut.setUserSetting({key: 'test1', value: 1}, {session: null}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param "session" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param setting is no object', function (done) {
                sut.setUserSetting(null, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param setting has no property "key"', function (done) {
                sut.setUserSetting({a: 'w', value: 4}, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the key in the param setting is an empty string', function (done) {
                sut.setUserSetting({key: '', value: 4}, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when there is a database error', function (done) {
                var rightsMock = require(path.join(rootPath, 'lib', 'rights'))({config: config, loggers: appMock.logging});
                rightsMock.getRepositories = function () {
                    return {
                        users: {
                            findOneById: function (id, options, ccc) {
                                ccc('error');
                            }
                        }
                    };
                };

                testUser.settings = null;

                var sut2 = require(path.join(rootPath, 'lib', 'settings'))({config: config, loggers: appMock.logging, rights: rightsMock});

                sut2.setUserSetting({key: '1', value: 4}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toEqual({ name : 'SettingsError', message : 'Error while loading the settings', status : 500, displayClient : false });
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the user is not found in the db', function (done) {
                sut.setUserSetting({key: 'aaa', value: 1}, {session: {user: {_id: '5280d688f9ce892133000001'}}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Cannot save settings. User not found: {"_id":"5280d688f9ce892133000001","settings":{"language":"de-de","test":1}}');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should save a user setting in the db', function (done) {
                testUser.settings = null;
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSetting({key: 'demo', value: true}, {session: {user: user}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings).toEqual({language: 'de-de', test: 1, demo: true});

                            done();
                        });
                    });
                });
            });
        });

        describe('setUserSettings()', function () {
            it('should return an error when the param session is wrong', function (done) {
                sut.setUserSettings({key: 'test', value: 1}, {session: null}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param "session" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param data is no object', function (done) {
                sut.setUserSettings(null, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param "data" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should update nothing when the user is not found', function (done) {
                sut.setUserSettings({key: 'test', value: 1}, {session: {user: {_id: '5280d688f9ce892133000001'}}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Cannot save settings. User not found: {"_id":"5280d688f9ce892133000001","settings":{}}');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error there is a database error', function (done) {
                var rightsMock = require(path.join(rootPath, 'lib', 'rights'))({config: config, loggers: appMock.logging});
                rightsMock.getRepositories = function () {
                    return {
                        users: {
                            update: function (id, options, ccc) {
                                ccc('error');
                            }
                        }
                    };
                };

                var sut2 = require(path.join(rootPath, 'lib', 'settings'))({config: config, loggers: appMock.logging, rights: rightsMock});

                sut2.setUserSettings({key: 'demo', value: true}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBe('error');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return a Validation Error when the settings are not valid', function (done) {
                sut.setUserSettings({test: true, demo: 1}, {session: {user: {name: 'guest'}}}, function (err, res) {
                    expect(err instanceof ValidationError).toBeTruthy();
                    expect(err.errors).toEqual([
                        { attribute: 'type', property: 'test', expected: 'integer', actual: 'boolean', message: 'must be of integer type' },
                        { attribute: 'type', property: 'demo', expected: 'boolean', actual: 'number', message: 'must be of boolean type' }
                    ]);
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should trim the settings values', function (done) {
                var request = {
                    session: {
                        user: {
                            name: 'guest'
                        }
                    }
                };

                sut.setUserSettings({language: ' 123 '}, request, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();
                    expect(request.session.user.settings).toEqual({language: '123'});

                    done();
                });
            });

            it('should convert the settings values', function (done) {
                var request = {
                    session: {
                        user: {
                            name: 'guest'
                        }
                    }
                };

                sut.setUserSettings({start: '2013-01-09'}, request, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();
                    expect(lxHelpers.isDate(request.session.user.settings.start)).toBeTruthy();

                    sut.setUserSettings({mail: 'test@gmail.com'}, request, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();
                        expect(request.session.user.settings.mail).toBe('test@gmail.com');

                        sut.setUserSettings({pages: 10}, request, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toBeTruthy();
                            expect(request.session.user.settings.pages).toBe(10);

                            done();
                        });
                    });
                });
            });

            it('should delete settings values which are not defined in the settings schema', function (done) {
                var request = {
                    session: {
                        user: {
                            name: 'guest'
                        }
                    }
                };

                sut.setUserSettings({language: 'en-us', wayne: 'ee'}, request, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();
                    expect(request.session.user.settings).toEqual({language: 'en-us'});

                    done();
                });
            });

            it('should save a user settings in the db', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings({test: 1, demo: true}, {session: {user: user}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        userRepo.findOneById(user._id, function (err, res) {
                            expect(err).toBeNull();
                            expect(res.settings).toEqual({test: 1, demo: true});

                            done();
                        });
                    });
                });
            });
        });

        describe('getUserSettings()', function () {
            it('should return an error when the param session is wrong', function (done) {
                sut.getUserSettings(null, {session: null}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param "session" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return the default client settings when the user does not exists', function (done) {
                testUser.settings = null;
                sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({language: 'de-de', test: 1});
                    expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                    expect(appMock.logging.syslog.warn.calls.length).toBe(1);
                    expect(appMock.logging.syslog.warn.mostRecentCall.args[0]).toEqual('settings: user not found: %j');
                    expect(appMock.logging.syslog.warn.mostRecentCall.args[1]).toEqual(testUser);

                    done();
                });
            });

            it('should return the default client settings when the user has no settings yet', function (done) {
                sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({language: 'de-de', test: 1});

                    done();
                });
            });

            it('should return the default client settings when the user is the guest user', function (done) {
                sut.getUserSettings(null, {session: {user: {name: 'guest'}}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({language: 'de-de', test: 1});

                    done();
                });
            });

            it('should return the settings already in the session', function (done) {
                testUser.settings = {test: 99};
                sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({test: 99});

                    done();
                });
            });

            it('should return the settings of the user', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings({test: 99, demo: false}, {session: {user: testUser}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toEqual({test: 99, demo: false});

                            done();
                        });
                    });
                });
            });
        });

        describe('getUserSetting()', function () {
            it('should return an error when the param session is wrong', function (done) {
                sut.getUserSetting(null, {session: null}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param "session" is of type null! Type object expected');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param data is empty', function (done) {
                sut.getUserSetting(null, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param data.key is missing', function (done) {
                sut.getUserSetting({}, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the param data.key is an empty string', function (done) {
                sut.getUserSetting({key: ''}, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return the an error when there is an mongodb error', function (done) {
                testUser.settings = null;
                var mock = lxHelpers.clone(rights);
                mock.getRepositories = function () {
                    return {
                        users: {
                            findOneById: function (a, b, cb) {
                                cb('err');
                            }

                        }
                    };
                };

                var sutter = require(path.join(rootPath, 'lib', 'settings'))({config: config, loggers: appMock.logging, rights: mock});
                sutter.getUserSetting({key: 'aa'}, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Error while loading the settings');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the user does not exists', function (done) {
                testUser.settings = null;
                sut.getUserSetting({key: 'aa'}, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Setting with key %s not found');
                    expect(res).toBeUndefined();

                    expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                    expect(appMock.logging.syslog.warn.calls.length).toBe(1);
                    expect(appMock.logging.syslog.warn.mostRecentCall.args[0]).toEqual('settings: user not found: %j');
                    expect(appMock.logging.syslog.warn.mostRecentCall.args[1]).toEqual(testUser);

                    done();
                });
            });

            it('should return an error when the user has no settings', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.getUserSetting({key: 'aa'}, {session: {user: testUser}}, function (err, res) {
                        expect(err instanceof SettingsError).toBeTruthy();
                        expect(err.message).toBe('Setting with key %s not found');
                        expect(res).toBeUndefined();

                        expect(appMock.logging.syslog.warn).not.toHaveBeenCalled();

                        done();
                    });
                });
            });

            it('should return the setting from the session', function (done) {
                testUser.settings = {aa: 33};
                sut.getUserSetting({key: 'aa'}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual(33);

                    done();
                });
            });

            it('should return the setting of the user', function (done) {
                userRepo.insert(testUser, function (err, res) {
                    var user = res[0];

                    expect(err).toBeNull();
                    expect(user.id).toBe(testUser.id);

                    sut.setUserSettings({test: 11, demo: false}, {session: {user: testUser}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBeTruthy();

                        sut.getUserSetting({key: 'test'}, {session: {user: testUser}}, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toEqual(11);

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

        describe('getUserSettings()', function () {
            it('should return the default client settings on first run', function (done) {
                sut.getUserSettings(null, sessionForGuestUser, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({language: 'de-de', test: 1});

                    done();
                });
            });

            it('should return the default client settings when the setting file does not exists', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                if (fs.existsSync(settingsFile)) {
                    fs.unlinkSync(settingsFile);
                }

                if (fs.existsSync(settingsFolder)) {
                    fs.rmdirSync(settingsFolder);
                }

                sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toEqual({language: 'de-de', test: 1});

                    done();
                });
            });

            it('should return default client settings and log an error when the setting files cannot be parsed', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                sut.setUserSettings({test: 1}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.writeFileSync(settingsFile, 'aaa,bbb');

                    sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual({language: 'de-de', 'test': 1});

                        expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                        expect(appMock.logging.syslog.warn.calls.length).toBe(1);

                        done();
                    });
                });
            });

            it('should return the settings of the user', function (done) {
                sut.setUserSettings({test: 44, demo: false}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    sut.getUserSettings(null, {session: {user: testUser}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual({test: 44, demo: false});

                        done();
                    });
                });
            });
        });

        describe('getUserSetting()', function () {
            it('should return the an error when the param data is empty', function (done) {
                sut.getUserSetting(null, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return the an error when the param data.key is missing', function (done) {
                sut.getUserSetting({}, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return the an error when the param data.key is an empty string', function (done) {
                sut.getUserSetting({key: ''}, sessionForGuestUser, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Param data is missing or has no/wrong/empty property key');
                    expect(res).toBeUndefined();

                    done();
                });
            });

            it('should return an error when the setting file does not exists', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                if (fs.existsSync(settingsFile)) {
                    fs.unlinkSync(settingsFile);
                }

                if (fs.existsSync(settingsFolder)) {
                    fs.rmdirSync(settingsFolder);
                }

                sut.getUserSetting({key: 'a'}, {session: {user: testUser}}, function (err, res) {
                    expect(err instanceof SettingsError).toBeTruthy();
                    expect(err.message).toBe('Setting with key %s not found');
                    expect(res).toBeUndefined();

                    expect(appMock.logging.syslog.error).toHaveBeenCalled();
                    expect(appMock.logging.syslog.error.calls.length).toBe(2);
                    expect(appMock.logging.syslog.error.calls[0].args[0]).toBe('settings: Error loading settings file: %s');
                    expect(appMock.logging.syslog.error.mostRecentCall.args[0]).toEqual({ errno: 34, code: 'ENOENT', path: settingsFile });

                    done();
                });
            });

            it('should return an error when the setting files cannot be parsed', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                sut.setUserSettings({test: 1}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.writeFileSync(settingsFile, 'aaa,bbb');

                    sut.getUserSetting({key: 'a'}, {session: {user: testUser}}, function (err, res) {
                        expect(err instanceof SettingsError).toBeTruthy();
                        expect(err.message).toBe('Setting with key %s not found');
                        expect(res).toBeUndefined();

                        expect(appMock.logging.syslog.warn).toHaveBeenCalled();
                        expect(appMock.logging.syslog.warn.calls.length).toBe(1);
                        expect(appMock.logging.syslog.warn.calls[0].args[0]).toBe('settings: Cannot parse settings file: %s');
                        expect(appMock.logging.syslog.warn.calls[0].args[1]).toBe(settingsFile);

                        done();
                    });
                });
            });

            it('should return an error when the key not exists in the settings', function (done) {
                sut.setUserSettings({test: 44, demo: false}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    sut.getUserSetting({key: 'aa'}, {session: {user: testUser}}, function (err, res) {
                        expect(err instanceof SettingsError).toBeTruthy();
                        expect(err.message).toBe('Setting with key %s not found');
                        expect(res).toBeUndefined();

                        done();
                    });
                });
            });

            it('should return the setting of the user', function (done) {
                sut.setUserSettings({test: 44, demo: false}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    sut.getUserSetting({key: 'test'}, {session: {user: testUser}}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(44);

                        done();
                    });
                });
            });
        });

        describe('setUserSetting()', function () {
            it('should save a user setting in the file system', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');

                if (fs.existsSync(settingsFile)) {
                    fs.unlinkSync(settingsFile);
                }

                sut.setUserSetting({key: 'demo', value: true}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toBe(JSON.stringify({language: 'de-de', test: 1, demo: true}));

                        done();
                    });
                });
            });
        });

        describe('setUserSettings()', function () {
            it('should save the user settings in the file system', function (done) {
                sut.setUserSettings({test: 8}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(JSON.stringify({test: 8}));

                        done();
                    });
                });
            });

            it('should create the settings directory before saving a user settings in the file system', function (done) {
                var settingsFile = path.join(settingsFolder, testUser.name + '.json');
                fs.unlinkSync(settingsFile);
                fs.rmdirSync(settingsFolder);

                sut.setUserSettings({test: 4, demo: false}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFile), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(JSON.stringify({test: 4, demo: false}));

                        done();
                    });
                });
            });
        });

        describe('resetUserSettings()', function () {
            it('should reset the user settings', function (done) {
                sut.setUserSettings({test: 11}, {session: {user: testUser}}, function (err, res) {
                    expect(err).toBeNull();
                    expect(res).toBeTruthy();

                    fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                        expect(err).toBeNull();
                        expect(res).toEqual(JSON.stringify({test: 11}));

                        sut.resetUserSettings(null, {session: {user: testUser}}, function (err, res) {
                            expect(err).toBeNull();
                            expect(res).toBeTruthy();

                            fs.readFile(path.join(settingsFolder, testUser.name + '.json'), {encoding: 'utf-8'}, function (err, res) {
                                expect(err).toBeNull();
                                expect(res).toEqual(JSON.stringify({language: 'de-de', test: 1}));

                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});