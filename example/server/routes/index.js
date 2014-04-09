'use strict';

/**
 * Configure the application routes
 *
 * @param app
 */
module.exports = function(app) {

    // Admin
    var admin = function(req, res, next){
        throw new Error('Ein ganz schlimmer Fehler....');
        res.render('app/admin/index');
    };

    // Demo
    var demo = function(req, res){
        res.render('app/demo/index');
    };

    // Application routes
    app.get('/admin', admin);
    app.get('/admin/*', admin);
    app.get('/demo', demo);
    app.get('/demo/*', demo);
};