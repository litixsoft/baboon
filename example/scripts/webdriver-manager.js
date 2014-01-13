'use strict';

var cmd = 'webdriver-manager';
var spawn = require('child_process').spawn;
var task = process.argv[2];

if (task) {
    spawn(cmd, [task], { stdio: 'inherit', env: process.env });
} else {
    console.error('No task specified!');
}
