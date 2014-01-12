'use strict';

// Module dependencies.
var express = require('express');

var app = express();


// Express Configuration
require('./server/config/express')(app);

// Controllers
var api = require('./server/controllers/api'),
    index = require('./server/controllers');

// Server Routes
app.get('/api/awesomeThings', api.awesomeThings);

// Angular Routes
app.get('/partials/*', index.partials);
app.get('/*', index.index);

// Start server
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});

// Expose app
var exports;
exports = module.exports = app;