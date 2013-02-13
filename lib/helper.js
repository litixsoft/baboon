module.exports = (function () {
    'use strict';

    var users = {timo: {id: 1, name: 'Timo Liebetrau', psw: 'a', salt: '', hash: ''}},
        pwd = require('pwd'),
        pub = {};

    pwd.hash('a', function (err, salt, hash) {
        users.timo.salt = salt;
        console.log('salt');
        console.log(salt);
        users.timo.hash = hash;
        console.log('hash');
        console.log(hash);
    });

    pub.authenticate = function (name, pass, fn) {
        if (!module.parent) {
            console.log('authenticating %s:%s', name, pass);
        }
        var user = users[name];
        // query the db for the given username
        if (!user) {
            fn(new Error('cannot find user'));
        }
        else {
            // apply the same algorithm to the POSTed password, applying
            // the hash against the pass / salt, if there is a match we
            // found the user
            pwd.hash(pass, users[name].salt, function (err, hash) {
                if (users[name].hash === hash) {
                    console.log(users[name].hash);
                    fn(null, user);
                } else {
                    fn(new Error('invalid password'));
                }
            });
        }
    };

    return pub;

})();