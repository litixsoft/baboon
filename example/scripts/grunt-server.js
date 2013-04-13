'use strict';

var cmd = 'grunt';

if(process.platform === 'win32') {
    cmd = 'grunt.cmd';
}

var spawn = require('child_process').spawn,
    child = spawn(cmd,['server']);

child.stdin.setEncoding = 'utf-8';
child.stdout.pipe(process.stdout);