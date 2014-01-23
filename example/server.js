'use strict';

// Module dependencies.
var express = require('express');

var app = express();


// Express Configuration
require('./server/config/express')(app);

// Controllers
var api = require('./server/controllers/api'),
    index = require('./server/controllers');

// Api Routes
app.get('/api/awesomeThings', api.awesomeThings);
app.get('/api/ssl/awesomeThings', api.awesomeThings);

// Toplevel Routes
app.get('/admin', index.admin);
app.get('/projects/project1', index.projects);

// Angular Routes
app.get('/*.html', index.partials);
app.get('/*', index.index);

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});

// Expose app
var exports;
exports = module.exports = app;