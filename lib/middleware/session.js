'use strict';

module.exports = function(baboon) {

    var pub = {};
    //var config = baboon.config;
    var syslog = baboon.loggers.syslog;

    /**
     * Middleware init session
     *
     * When session.user not exists then create in session:
     * user = {id: -1, name: 'guest'}
     * activity = new Date();
     * start = new Date();
     *
     * @param req
     * @param res
     * @param next
     */
    pub.initSession = function(req, res, next) {

        // check if session exists
        if (!req.session.user) {

            req.session.activity = new Date();
            req.session.start = new Date();
            req.session.data = {};

            req.session.user = {id: -1, name: 'guest'};

            syslog.debug('session is newly, add guest and set new start + activity time.');

            next();
        }
        else {
            next();
        }
    };

    /**
     * Middleware check session activity
     * Checks the inactive and max life time of session.
     * Is the time exceeded then regenerated the session and make a new session init.
     *
     * @param req
     * @param res
     * @param next
     */
    pub.checkActivitySession = function(req, res, next) {

        baboon.session.checkActivitySession(req.session, function(error, active) {

            if (error) {
                next(error);
            }

            // check session active
            if (!active) {

                // session to long inactive or max lifetime is over
                // session was regenerated
                // new init session
                pub.initSession(req, res, next);
            }
            else {
                // session ok
                next();
            }
        });
    };

    return pub;
};
