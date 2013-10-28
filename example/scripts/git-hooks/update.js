#!/usr/bin/env node

console.log('Start Tests before pushing repo ');
process.exit(1);

var cmd = process.platform === 'win32' ? 'grunt.cmd' : 'grunt';

var spawn = require('child_process').spawn,
    child = spawn(cmd, ['test']);

child.stdin.setEncoding = 'utf-8';
child.stdout.setEncoding = 'utf-8';
child.stdout.pipe(process.stdout);

//child.stdin.end();

//child.stdout.on('data', function (data) {
//    console.log('stdout: ' + data);
//});
//
//child.stderr.on('data', function (data) {
//    console.log('stderr: ' + data);
//});

child.on('close', function (code) {
    console.log('Grunt process closed with code ' + code);
    process.exit(code);
});

//child.on('exit', function (code) {
//    console.log('child process exited with code ' + code);
//    process.exit(code);
//});

child.on('error', function (error) {
    console.log('Grunt process exited with error ' + error);
    process.exit(1);
});

//console.log('end');

//process.exit(1);