'use strict';

module.exports = function (grunt) {
    var path = require('path');

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({

        // Project settings
        clean: {
            dox: ['docs/public/partials/api']
        },
        express: {
            options: {
//                port: config_dev.port,
//                host: config_dev.host
                host: '127.0.0.1',
                port: 3060,
                livereload: true,
                nospawn: true //Without this option specified express won't be reloaded
            },
            prod: {
                options: {
//                    script: 'bin/server.js'
                    script: 'app.js'
                }
            }
        },
        open: {
            server: {
                url: 'http://<%= express.options.host %>:<%= express.options.port %>'
            }
        },
        bgShell: {
            createdoxx: {
                cmd: 'doxx --source ../lib --template _templates/templatesmall.jade --target public/partials/api'
            }
        }
    });

    require('express')(grunt);

    /**
     * Gets a file and read`s it to fetch the id`s of the different api methods in one api-doc file.
     *
     * @param {!string} folder The path to the current api-doc file.
     */
    function getDocNavIds(folder){

        var nav = grunt.file.read(folder.filepath);//'.tmp/docs/lib/baboon.js.html');

//        var matches = nav.match(/<h2 id="([^"]*?)".*?>(.+?)<\/h2>/gi);
        var matches = nav.match(/<section id="([^"]*?)".*?>/gi);
        var file = folder.filename.replace('.js.html','');
        var sub = '';
        if(folder.subdir){
            sub = folder.subdir+'/';
        }
        var results = { title: sub+''+file+'.js', link: sub+''+file, vis: false, children: [] };

        for (var i in matches) {
            var parts = matches[i].split('"');
            var sublink = { title: parts[1], link: sub+''+file+'#'+parts[1] };
            results.children.push(sublink);
        }
        return results;
    }


    grunt.registerTask('getDocNav', function(){

//        var docRootPath = '.tmp/docs/lib/';
        var docRootPath = 'public/partials/api/';
        var rootFolder = [];
        var subFolder = [];
        var navObj = [];
        grunt.file.recurse(docRootPath, function(abspath, rootdir, subdir, filename){
            if(filename!=='index.html') {
                if(subdir){
                    var objR = {filepath: abspath, filename: filename, subdir: subdir};
                    subFolder.push(objR);
                } else {
                    var objS = {filepath: abspath, filename: filename};
                    rootFolder.push(objS);
                }
            }
        });

        for (var j=0;j< rootFolder.length; j++) {
            navObj.push(getDocNavIds(rootFolder[j]));
        }
        for (var k=0;k< subFolder.length; k++) {
            navObj.push(getDocNavIds(subFolder[k]));
        }

        grunt.file.write('public/partials/apiNavigation.js', 'var apiNav = '+JSON.stringify(navObj)+';');
    });

    grunt.registerTask('doc', ['clean:dox', 'bgShell:createdoxx','getDocNav']);

    grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
        this.async();
    });
    // task that simply waits for 1 second, usefull for livereload
    grunt.registerTask('wait', function () {
        grunt.log.ok('Waiting...');

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln('Done waiting!');
            done();
        }, 1000);
    });

    grunt.registerTask('serve', function (target) {
//        return grunt.task.run(['doc', 'express:prod', 'open:server', 'express-keepalive']);
        return grunt.task.run([
            'doc',
            'express:prod',
            'wait',
            'open:server',
            'express-keepalive'
        ]);
    });
};