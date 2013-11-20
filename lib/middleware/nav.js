'use strict';

module.exports = function () {
    var pub = {};

    pub.getNavData = function (req, res) {

        if (! req.session.navigation) {
            res.json({error: 'no navigation found in session!'});
            return;
        }

        res.json({error: null, data: req.session.navigation});
    };

    return pub;
};