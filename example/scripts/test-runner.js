'use strict';
var cmd = 'karma';

if(process.platform === 'win32') {
    cmd = 'karma.cmd';
}

var spawn = require('child_process').spawn,
    child = spawn(cmd,['run']);

child.stdin.setEncoding = 'utf-8';
child.stdout.pipe(process.stdout);
