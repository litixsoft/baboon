'use strict';

var path = require('path');

exports.partials = function (req, res) {
    var stripped = req.url.split('.')[0];
    var requestedView = path.join('./', 'partials', stripped);
    res.render(requestedView, function (err, html) {
        if (err) {
            res.render('404');
        } else {
            res.send(html);
        }
    });
};

exports.index = function (req, res) {
    res.render('app/main/index');
};

exports.admin = function(req, res){
    res.render('app/admin/index');
};

exports.projects = function(req, res){
    res.render('app/projects/project1/index');
};