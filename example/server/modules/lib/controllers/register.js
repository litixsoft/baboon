'use strict';

var lxDb = require('lx-mongodb');

module.exports = function (app) {
    var pub = {},
        db = lxDb.GetDb(app.config.mongo.rights, ['users']),
        repo = require('../repositories/usersRepository')(db.users);

    /**
     * Register a new user in database
     *
     * @roles Guest
     * @description Register a new user
     */
    pub.registerUser = function (data, req, callback) {

//        repo.validate(data, { schema: { properties: repo.getSchemaForRegistration() }} , function (error, result) {
        repo.validate(data, {} , function (error, result) {

            if (error) {
                callback(new app.Error(error.toString()));
            }
            else {
                if(result.valid){
                    var time = new Date();
                    data.timestamp = time; //sets a timestamp to proof if and when a user was created
                    data.status = 'unregistered';

                    repo.insert(data, function(error, result){
                        if (error) {
                            callback(new app.Error(error));
                        } else {
                            app.mail.sendMail({data : data, mongoid: result[0]._id},function(error, result){
                                if(error){
                                    callback(new app.Error(error));
                                } else {
                                    callback(null,result);
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
     * Create a new password for user
     *
     * @roles Guest
     * @description Create a new password
     */
    pub.createNewPassword = function (data, req, callback) {
        app.logging.syslog.debug('new create new Password implementation');
        repo.find(function(error, result) {

            var response = {};

            if (error) {
                response = error;
            }
            else {
                response = result;
            }

            var echoTest = {
                header: 'echoTest from server createNewPassword',
                receivedFromClient: data,
                sentFromServer: response
            };

            callback(null, echoTest);
        });
    };

    return pub;
};