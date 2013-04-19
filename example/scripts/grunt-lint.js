'use strict';

var cmd = 'grunt';

if (process.platform === 'win32') {
    cmd = 'grunt.cmd';
}

var spawn = require('child_process').spawn,
    child = spawn(cmd,['lint']);

child.stdout.on('data', function (data) {
    console.log(data.toString());
});

child.stderr.on('data', function (data) {
    console.log(data.toString());
});

child.on('close', function (code) {
    console.log('child process exited with code ' + code);
});