module.exports = function(middleware) {
    'use strict';

    var pub = {};

    middleware = null;

    pub.index = function(req, res){
        throw new Error("Ganz schlimmer Fehler");
        res.render('index', {title: 'Baboon Demo Application'});
    };

    pub.login = function(req, res){
        res.render('login', { title: 'Baboon Login' });
    };

    pub.module1 = function(req, res){
        res.render('module1', { title: 'Baboon Modul1' });
    };

    pub.module2 = function(req, res){
        res.render('module2', { title: 'Baboon Modul2' });
    };

    return pub;
};