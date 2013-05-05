'use strict';
var path = require('path');
var cmd = 'karma';

if(process.platform === 'win32') {
    cmd = 'karma.cmd';
}

var config = path.join(__dirname, '../', 'config', 'karma-e2e.conf.js');


var spawn = require('child_process').spawn,
    child = spawn(cmd,['start', config, '--no-single-run']);

child.stdin.setEncoding = 'utf-8';
child.stdout.pipe(process.stdout);
