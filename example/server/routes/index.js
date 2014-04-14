'use strict';

/**
 * Configure the application routes
 *
 * @param app
 */
module.exports = function(app) {

    // Admin
    var admin = function(req, res) {
        res.render('app/admin/index');
    };

    // Demo
    var demo = function(req, res){
        res.render('app/demo/index');
    };

    // All other routes to main angular app
    var allOther = function(req, res) {
        res.render('app/main/index');
    };

    // Application routes
    app.get('/admin', admin);
    app.get('/admin/*', admin);
    app.get('/demo', demo);
    app.get('/demo/*', demo);

    // Angular main app route
    app.get('*', allOther);
};