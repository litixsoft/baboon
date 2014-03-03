'use strict';

/**
 * Configure the application routes
 *
 * @param app
 */
module.exports = function(app) {

    // Admin
    var admin = function(req, res){
        res.render('app/admin/index');
    };

    // Application routes
    app.get('/admin', admin);
    app.get('/admin/*', admin);
};