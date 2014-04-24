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

    // Guide
    var guide = function(req, res){
        res.render('app/guide/index');
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
    app.get('/guide', guide);
    app.get('/guide/*', guide);
};