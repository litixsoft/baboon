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

    // project1
    var project1 = function(req, res){
        res.render('app/projects/project1/index');
    };

    // Application routes
    app.get('/admin', admin);
    app.get('/admin/*', admin);
    app.get('/project1', project1);
    app.get('/project1/*', project1);

};