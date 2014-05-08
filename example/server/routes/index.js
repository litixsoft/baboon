'use strict';
var express = require('express');
var router = express.Router();

/**
 * Configure the application routes
 * Use always on end the catch all route with * for the angular main app
 */

router.get('/admin', function(req, res) {
    res.render('app/admin/index');
});

router.get('/admin/*', function(req, res) {
    res.render('app/admin/index');
});

router.get('/demo', function(req, res) {
    res.render('app/demo/index');
});

router.get('/demo/*', function(req, res) {
    res.render('app/demo/index');
});

router.get('/apidoc', function(req, res) {
    res.render('app/apidoc/index');
});

router.get('/apidoc/*', function(req, res) {
    res.render('app/apidoc/index');
});

router.get('/guide', function(req, res) {
    res.render('app/guide/index');
});

router.get('/guide/*', function(req, res) {
    res.render('app/guide/index');
});
router.get('*', function(req, res) {
    res.render('app/main/index');
});

module.exports = router;