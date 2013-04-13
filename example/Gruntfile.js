'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            reports: ['build/reports'],
            dist: ['build/dist'],
            app: ['build/dist/app','build/dist/*.html', 'build/dist/app.js'],
            static: ['build/dist/static']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'client/app/**/*.js', 'test/unit/**/*.js', 'test/e2e/**/*.js'],
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
            client: {
                files: [
                    { dest: 'build/dist/', src : ['*.html','!index.html'], expand: true, cwd: 'client/' }
                ]
            },
            views: {
                files: [
                    {dest: 'build/dist/app', src: '**/views/*.html', expand: true, cwd:'client/app/'}
                ]
            },
            static: {
                files: [
                    { dest: 'build/dist/static/', src : '**', expand: true, cwd: 'client/assets/' },
                    { dest: 'build/dist/static/css/bootstrap.css', src : 'client/vendor/bootstrap/css/bootstrap.css'},
                    { dest: 'build/dist/static/img/', src : '*.png', expand: true, cwd: 'client/vendor/bootstrap/img/'},
                    { dest: 'build/dist/static/js/bootstrap.js', src : 'client/vendor/bootstrap/js/bootstrap.js'},
                    { dest: 'build/dist/static/js/jquery.js', src : 'client/vendor/jquery/jquery.js'}
                ]
            }
        },
        concat: {
            app: {
                src: ['client/vendor/livereload.js','client/app/**/*.js','!client/app/**/controllers/*.js', '!client/app/**/directives/*.js',
                    '!client/app/**/filters/*.js', '!client/app/**/services/*.js'],
                dest: 'build/dist/app.js'
            },
            controller: {
                src: ['client/app/**/controllers/*.js'],
                dest: 'build/dist/app/controllers.js'
            },
            directives: {
                src: ['client/app/**/directives/*.js'],
                dest: 'build/dist/app/directives.js'
            },
            filters: {
                src: ['client/app/**/filters/*.js'],
                dest: 'build/dist/app/filters.js'
            },
            services: {
                src: ['client/app/**/services/*.js'],
                dest: 'build/dist/app/services.js'
            },
            angular: {
                src: ['client/vendor/angular/angular.js'],
                dest: 'build/dist/static/js/angular.js'
            }
        },
        server: {
            script: 'scripts/server.js'
        },
        livereload: {
            port: 35729 // Default livereload listening port.
        },
        // Configuration to be run (and then tested)
        regarde: {
            app: {
                files: ['client/app/**/*.*', 'client/*.html'],
                tasks: ['build:app', 'livereload']
            },
            static: {
                files: ['client/assets/**/*.*', 'client/vendor/**/*.*'],
                tasks: ['build:static', 'livereload']
            },
            server: {
                files: 'server/**/*.*',
                tasks: ['express-server','livereload']
            }
        },
        open: {
            server: {
                url: '<%= conf.development.baseUrl %>'
            }
        },
        replace: {
            debug: {
                options: {
                    variables: {
                        'livereload-->': '<script src="http://localhost:<%=livereload.port%>/livereload.js?snipver=1"></script>'
                    },
                    prefix: '<!--'
                },
                files: [
                    {expand: true, flatten: true, src: ['client/index.html'], dest: 'build/dist/'}
                ]
            },
            release: {
                options: {
                    variables: {
                        'livereload-->': ''
                    },
                    prefix: '<!--'
                },
                files: [
                    {expand: true, flatten: true, src: ['client/index.html'], dest: 'build/dist/'}
                ]
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-karma');

    // Tasks
    grunt.registerTask('test', ['clean:reports', 'jshint:files', 'karma']);
    grunt.registerTask('build', ['clean:dist', 'copy', 'concat', 'replace:release']);
    grunt.registerTask('build:app', ['clean:app', 'copy:client', 'copy:views', 'concat:app', 'concat:controller',
        'concat:directives', 'concat:filters', 'concat:services', 'replace:debug']);
    grunt.registerTask('build:static', ['clean:static', 'copy:static', 'concat:angular']);
    grunt.registerTask('release', ['clean:dist', 'copy', 'concat', 'replace:release']);
    grunt.registerTask('server', ['build', 'livereload-start', 'express-server', 'replace:debug', 'open:server', 'regarde' ]);

    // Default task.
    grunt.registerTask('default', ['test']);
};