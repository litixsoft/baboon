'use strict';
var express = require('express');


module.exports = function (baboon) {

    var router = express.Router();
    var auth = baboon.middleware.auth;

    router.get('/demo', auth.restricted, function (req, res) {
        res.render('app/demo/index');
    });

    router.get('/demo/*', auth.restricted, function (req, res) {
        res.render('app/demo/index');
    });

    router.get('/admin', auth.restrictedAdmin, function (req, res) {
        res.render('app/admin/index');
    });

    router.get('/admin/*', auth.restrictedAdmin, function (req, res) {
        res.render('app/admin/index');
    });

    router.get('/account/*', function (req, res) {
        res.render('app/account/index');
    });

    router.get('*', auth.restrictedUser, function (req, res) {
        res.render('app/main/index');
    });

    return router;
};