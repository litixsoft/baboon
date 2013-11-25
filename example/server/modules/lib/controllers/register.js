'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (app) {
    var pub = {},
        crypto = require('crypto'),
        tokenRepo = app.rights.getRepositories().token,
//        repo = app.rights.getRepositories().users;
        db = lxDb.GetDb(app.config.mongo.rights, ['users']),
        repo = require('../repositories/usersRepository')(db.users);
//        tokenRepo = lxDb.BaseRepo(db.token);

    function createGUID(date, email, mongoid){

        var shasum = crypto.createHash('sha1');
        var hashString = (email.toString() || '') + ':' + date.toISOString() + ':' + (mongoid.toString() || '');

        // Hash String
        shasum.update(hashString);

        // Ids
        var guid = shasum.digest('hex');

        return guid;
    }

    /**
     * Register a new user in database
     *
     * @roles Admin, Guest
     * @description Register a new user
     */
    pub.registerUser = function (data, req, callback) {

//        repo.validate(data, { schema: { properties: repo.getSchemaForRegistration() }} , function (error, result) {
        repo.validate(data, {} , function (error, result) {

            if (error) {
                callback(error);
            }
            else {
                if(result.valid){
                    var time = new Date();
//                    data.timestamp = time; //sets a timestamp to proof if and when a user was created
                    data.status = 'unregistered';

                    repo.create(data, function(error, result){
                        if (error) {
                            callback(error);
                        } else {

                            var time = new Date();
//                            var guid = createGUID(time,data.email,result[0]._id);
//
//                            repo.findOne({guid: data.email},function(error,result){
//
//                            });

                            var tokenData = {
                                guid: createGUID(time,data.email,result[0]._id),
                                timestamp: time,
                                type: 'register',
                                userid: result[0]._id,
                                email: data.email
                            }


                            tokenRepo.create(tokenData,function(error,result){
                                if(error){
                                    callback(error);
                                } else {
//                                    app.mail.sendMail({data : data, mongoid: result[0]._id}, 'register',function(error, result){
                                    app.mail.sendMail({data : data, guid: tokenData.guid}, 'register',function(error, result){
                                        if(error){
                                            callback(error);
                                        } else {
                                            callback(null,result);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    callback(new app.ValidationError(result.errors));
                }
            }

        });
    };

    /**
     * activate a new user in database
     *
     * @roles Admin, Guest
     * @description activate a new user after registration
     */
    pub.activateUser = function (data, req, callback) {

        var guid = {guid : data.guid};

        tokenRepo.findOne(guid,function(error,result){
            if(error){
                app.logging.syslog.error('Interner Servererror: database problem.');
                callback(error);
            } else {
                if(result){
                    var time = new Date();//getTime();
                    var hours = ( Math.abs(time - result.timestamp) / 3600000);
                    var userid = result.userid;
                    tokenRepo.remove({guid: guid.guid},function(error,result){
                        if(error){
                            callback(error);
                        } else {
                            if(result){
                                if(hours < 48){
                                    repo.update({_id: userid}, {$set: { status: 'active'}}, function(error,result){
                                        if(error){
                                            callback(error);
                                        } else {
                                            callback(error,result);
                                        }
                                    });
                                } else {
                                    repo.remove({_id: userid},function(error,result){
                                        if(error){
                                            callback(error);
                                        } else {
                                            callback(new app.ClientError('Der Aktivierungszeitraum ist abgelaufen, bitte registrieren Sie sich erneut.'));
                                        }
                                    });
                                }
                            } else {
                                callback(new app.ClientError('Konnte nicht gelöscht werden'));
                            }
                        }
                    });

                } else {
                    app.logging.syslog.error('Interner Servererror: guid could not be found.');
                    callback(new app.ClientError('Registrierungs ID konnte nicht gefunden werden.'));
                }
            }
        });
    };

    /**
     * Create a new password for user
     *
     * @roles Admin, Guest
     * @description Create a new password
     */
    pub.forgetPassword = function (data, req, callback) {

        var val = require('lx-valid');
        var schemaForTest = {
            'properties': {
                'email': {
                    'type': 'string',
                    'format': 'email',
                    'required': true
                }
            }
        };

        var result = val.validate(data, schemaForTest);

        if(result.valid){
            repo.findOne({email: data.email},function(error,result){
                if(error){
                    app.logging.syslog.error('Interner Servererror: Email could not be found.');
                    callback(new app.Error(error));
                } else {
                    if(result){
                        app.mail.sendMail({data : result, mongoid: result._id}, 'forget',function(error, result){
                            if(error){
                                callback(error);
                            } else {
                                callback(null,result);
                            }
                        });
                    } else {
                        callback(new app.ClientError('Email konnte nicht gefunden werden.'));
                    }
                }
            });
        } else {
            callback(new app.ValidationError(result.errors));
        }
    };


    /**
     * Create a new password for user
     *
     * @roles Admin, Guest
     * @description reset old password to a new password
     */
    pub.resetPassword = function (data, req, callback) {

        console.log("newPwd");
        console.log(data);
        callback(null,'toll');
    };

    return pub;
};