module.exports = (function () {
    'use strict';

    var users = {admin: {id: 1, name: 'Administrator', psw: 'a', salt: '', hash: ''}},
        pwd = require('pwd'),
        pub = {};

    pwd.hash('a', function (err, salt, hash) {
        users.admin.salt = salt;
        users.admin.hash = hash;
    });

    pub.authenticate = function (name, pass, cb) {
        var user = users[name];
        // query the db for the given username
        if (!user) {
            cb(new Error('cannot find user'));
        }
        else {
            // apply the same algorithm to the POSTed password, applying
            // the hash against the pass / salt, if there is a match we
            // found the user
            pwd.hash(pass, users[name].salt, function (err, hash) {
                if (users[name].hash === hash) {
                    console.log(users[name].hash);
                    cb(null, user);
                } else {
                    cb(new Error('invalid password'));
                }
            });
        }
    };

    return pub;

})();