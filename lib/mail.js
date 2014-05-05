'use strict';

var MailError = require('./errors').MailError;
var mailer = require('nodemailer');
var fs = require('fs');
var path = require('path');
var async = require('async');

/**
 * The mail module.
 *
 * @param {Object} config The mail config object.
 * @return {Object} An object with methods for sending mails.
 */
module.exports = function (config) {
    if (typeof config !== 'object') {
        throw new MailError('Parameter config is required!');
    }

    if (!config.type) {
        config.type = 'SMTP';
    }
    else if (config.type !== 'SMTP' && config.type !== 'PICKUP') {
        throw new MailError('Only SMTP or PICKUP allowed!');
    }

    var options = {
        maxConnections: config.maxConnections,
        maxMessages: config.maxMessages,
        debug: config.debug,
        ignoreTLS: config.ignoreTLS
    };

    if (config.type === 'SMTP') {
        options.host = config.host;
        options.port = config.port;
        options.auth = config.auth;
        options.secureConnection = config.useSsl;
    }
    else { // must be "PICKUP" because of validation before
        options.directory = config.directory;
    }

    var transport = mailer.createTransport(config.type, options);
    var pub = {};

    function configureMail (mail) {
        return {
            from: mail.from || config.from,
            to: mail.to || config.to,
            cc: mail.cc,
            bcc: mail.bcc,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
            generateTextFromHTML: mail.generateTextFromHTML || true
        };
    }

    /**
     * Sends a mail with the specified mail message.
     *
     * @param {Object} mail The mail message object.
     * @param {function(err,res)} callback The callback function.
     */
    pub.sendMail = function (mail, callback) {
        var mailMessage = configureMail(mail);

        transport.sendMail(mailMessage, function (error, result) {
            callback(error, result);
        });
    };

    /**
     * Sends a mail with the specified mail message und file templates.
     *
     * @param {Object} mail The mail message object.
     * @param {String} htmlFile Path to the html template.
     * @param {String} txtFile Path to the text template.
     * @param {Object} replaceValues An array with key value objects to replace dynamic content.
     * @param {function(err,res)} callback The callback function.
     */
    pub.sendMailFromTemplate = function (mail, htmlFile, txtFile, replaceValues, callback) {
        var mailMessage = configureMail(mail);

        async.auto({
            readHtmlFile: function (next) {
                if (!htmlFile) {
                    next(null, '');
                }
                else {
                    fs.readFile(path.resolve(config.templatePath, htmlFile), { encoding: 'utf8' }, next);
                }
            },
            readTextFile: function (next) {
                if (!txtFile) {
                    next(null, '');
                }
                else {
                    fs.readFile(path.resolve(config.templatePath, txtFile), { encoding: 'utf8' }, next);
                }
            },
            sendMail: ['readHtmlFile', 'readTextFile', function (next, innerResults) {
                if (replaceValues) {
                    for (var i = 0; i < replaceValues.length; i++) {
                        var item = replaceValues[i];
                        innerResults.readHtmlFile = innerResults.readHtmlFile.replace(item.key, item.value || '');
                        innerResults.readTextFile = innerResults.readTextFile.replace(item.key, item.value || '');
                    }
                }

                mailMessage.html = innerResults.readHtmlFile;
                mailMessage.text = innerResults.readTextFile;

                transport.sendMail(mailMessage, next);
            }]
        }, function (error, results) {
            if (error) {
                callback(error);
                return;
            }

            callback(error, results.sendMail);
        });
    };

    return pub;
};