'use strict';

/**
 *
 * @param {!Object} baboon
 * @returns {Object}
 */
module.exports = function(baboon) {
    var pub = {};
    var userRepo = require('../repositories')(baboon.config.rights.database).users;
    var AccountError = require('../errors').AccountError;
    var syslog = baboon.loggers.syslog;

    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // a and b are javascript Date objects
    function dateDiffInDays(a, b) {
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / _MS_PER_DAY);
    }

    /**
     * Activates an user account.
     *
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
    pub.activate = function(req, res, next) {
        // !!! Localization !!!
        // req.query.lang
        if (req.params) {
            userRepo.findOne({ token: req.params.token }, { fields: ['_id', 'register_date', 'is_approved'] }, function(error, result) {
                if(error) {
                    syslog.error('%s! getting user from db by token: %j', error, req.params.token);
                    next(new AccountError('Sorry, something went wrong.', 500, true));
                }
                else if(!result) {
                    next(new AccountError('User not found.', 404, true));
                }
                else {
                    if(dateDiffInDays(new Date(), result.register_date) < 30) {
                        next(new AccountError('The time-token is expired.', 500, true));
                    }
                    else {
                        userRepo.update({ _id: result._id }, { $set: { is_approved: true, token: null } }, { multi: false }, function (error, updateResult) {
                            if(error || !updateResult) {
                                syslog.error('%s! update user from db: %j', error, result._id);
                                next(new AccountError('Sorry, something went wrong.', 500, true));
                                return;
                            }
                            res.render('/account/login');
                        });
                    }
                }
            });
        }
        else {
            next();
        }
    };

    return pub;
};
