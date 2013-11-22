'use strict';

module.exports = function (conf) {

    var pub = {};

    var configFile = require(conf);
    var config = configFile[0].nodemail;
    var nodemailer = require('nodemailer');

    var connectionOptions = {
        host: config.host,
        port: config.port,
//        debug: true,
        auth: {
            user: config.user,
            pass: config.password
        }
    };


    // Connect to SMTP Server
    var transport = nodemailer.createTransport('SMTP', connectionOptions);

    /**
     * Send an Email with nodemailer
     *
     * @roles Admin, Guest
     * @description Gets all members from db
     * @param {object} data The query.
     * @param {!function(result)} callback The callback.
     */
    pub.sendMail = function (obj, callback) {


        var message = {};
        message.from = config.senderaddress;
        message.to = obj.data.email;//config.receiveraddress;
        message.subject = 'Baboon - Registrierungsformular';
        message.text  = 'Vielen Dank für Ihre Registrierung.\n\n' +
            'Ihr Zugang wurde mit folgenden Daten angelegt.\n\n' +
            'Benutzername:   '+obj.data.username+'\n' +
            'Name:   '+obj.data.displayName+'\n' +
            'E-Mail: '+obj.data.email+'\n\n ' +
            'Bitte bestätigen Sie ihre Registrierung mittels ihrer Email-Adresse, indem Sie den folgenden Link klicken:\n\n' +
            'http://127.0.0.1:3000/auth/activate:'+obj.mongoid+'\n\n' +
            'Falls Sie sich nicht als Mitglied auf 127.0.0.1 registriert haben, können Sie diese Nachricht einfach ignorieren, es wird dann kein Nutzeraccount angelegt.\n\n' +
            'Bitte bewahren Sie ihre Zugangsdaten sicher auf.\n\nMit freundlichen Grüßen\nIhr Litixsoft Team';

        // Send Message
        transport.sendMail(message, function (error, result) {

            callback(error,result);

        });

    };

    return pub;
};

