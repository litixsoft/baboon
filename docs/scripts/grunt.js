'use strict';

var cmd = process.platform === 'win32' ? 'grunt.cmd' : 'grunt';
var spawn = require('child_process').spawn;
var task = process.argv[2];

if (task) {
    spawn(cmd, [task], { stdio: 'inherit', env: process.env });
} else {
    console.error('No grunt task specified!');
}