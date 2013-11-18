'use strict';

module.exports = function () {
    var pub = {};

    pub.getNavData = function (req, res) {

        if (! req.session.navigation) {
            res.json(404, {message: 'no navigation found in session!'});
            return;
        }

        res.json(200, { data: req.session.navigation});
    };

    return pub;
};