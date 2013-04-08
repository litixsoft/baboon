/*global module*/
module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            build: ['build'],
            dist: ['client/dist']
        },
        // client dirs
        distDir: 'client/dist',
        srcDir: 'client/src',
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/server.js', '<%= srcDir %>/app/scripts/**/*.js', '<%= srcDir %>/test/**/*.js',
                '<%= srcDir %>/lib/**/*.js', 'server/test/**/*.js', 'server/api/**/*.js'],
            junit: 'build/reports/jshint.xml',
            checkstyle: 'build/reports/jshint_checkstyle.xml',
            options: {
                bitwise: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                regexp: true,
                undef: true,
                unused: true,
                strict: true,
                indent: 4,
                quotmark: 'single',
                es5: true,
                loopfunc: true,
                browser: true,
                node: true
            }
        },
        // copy files
        copy: {
            app: {
                files: [
                    { dest: '<%= distDir %>/', src : '*.html', expand: true, cwd: '<%= srcDir %>/app/' }
                ]
            },
            views: {
                files: [
                    { dest: '<%= distDir %>/views/', src : '**', expand: true, cwd: '<%= srcDir %>/app/views' }
                ]
            },
            assets: {
                files: [
                    { dest: '<%= distDir %>/static/', src : '**', expand: true, cwd: '<%= srcDir %>/assets/' }
                ]
            },
            vendor: {
                files: [
                    { dest: '<%= distDir %>/static/css/bootstrap.css', src : '<%= srcDir %>/vendor/bootstrap/css/bootstrap.min.css'},
                    { dest: '<%= distDir %>/static/img/', src : '*.png', expand: true, cwd: '<%= srcDir %>/vendor/bootstrap/img/'},
                    { dest: '<%= distDir %>/static/js/bootstrap.js', src : '<%= srcDir %>/vendor/bootstrap/js/bootstrap.min.js'},
                    { dest: '<%= distDir %>/static/js/jquery.js', src : '<%= srcDir %>/vendor/jquery/jquery.min.js'}
                ]
            }
        },
        concat: {
            app: {
                src: ['<%= srcDir %>/app/scripts/app.js'],
                dest: '<%= distDir %>/scripts/app.js'
            },
            lib: {
                src: ['<%= srcDir %>/lib/**/*.js'],
                dest: '<%= distDir %>/scripts/lib.js'
            },
            controller: {
                src: ['<%= srcDir %>/app/scripts/**/controllers.js'],
                dest: '<%= distDir %>/scripts/controllers.js'
            },
            directives: {
                src: ['<%= srcDir %>/app/scripts/**/directives.js'],
                dest: '<%= distDir %>/scripts/directives.js'
            },
            filters: {
                src: ['<%= srcDir %>/app/scripts/**/filters.js'],
                dest: '<%= distDir %>/scripts/filters.js'
            },
            services: {
                src: ['<%= srcDir %>/app/scripts/**/services.js'],
                dest: '<%= distDir %>/scripts/services.js'
            },
            angular: {
                src: ['<%= srcDir %>/vendor/angular/angular.min.js'],
                dest: '<%= distDir %>/static/js/angular.js'
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Default task.
    //noinspection JSUnresolvedFunction
    grunt.registerTask('default', ['clean:build', 'jshint:files']);
    grunt.registerTask('test', ['clean:build', 'jshint:files']);
    grunt.registerTask('build', ['clean:dist', 'copy', 'concat']);
};