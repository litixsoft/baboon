'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.config.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            reports: ['test/reports'],
            dist: ['dist'],
            app: ['dist/app','dist/*.*']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'client/app/**/*.js','test/**/*.js'],
            junit: 'test/reports/jshint.xml',
            checkstyle: 'test/reports/jshint_checkstyle.xml',
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
                indent: 4,
                quotmark: 'single',
                es5: true,
                loopfunc: true,
                browser: true,
                node: true,
                globals: {
                    angular: true
                }
            }
        },
        // copy files
        copy: {
            client: {
                files: [
                    { dest: 'dist/', src : ['*.*'], expand: true, cwd: 'client/' }
                ]
            },
            views: {
                files: [
                    {dest: 'dist/views', src: ['*.html', '**/*.html'], expand: true, cwd:'client/app/'}
                ]
            },
            assets: {
                files: [
                    { dest: 'dist', src : ['**','!README.md'], expand: true, cwd: 'client/assets' }
                ]
            },
            // all vendor file that need to be copy
            vendor: {
                files: [
                    { dest: 'dist/img', src : ['**'], expand: true, cwd: 'vendor/bootstrap/img/' }
                ]
            }
        },
        concat: {
            /**
             * The `libs` target is for all third-party js libraries we need to include
             * in the final distribution.
             */
            libs: {
                files: {
                    'dist/js/libs.js': [
                        'vendor/angular/angular.js',
                        'vendor/angular-ui-bootstrap/ui-bootstrap-0.2.0.js'
                    ]
                }
            },
            // all min lib css files
            libsCss: {
                files: {
                    'dist/css/libs.css': [
                        'vendor/bootstrap/css/bootstrap.min.css',
                        'vendor/bootstrap/css/bootstrap-responsive.min.css'
                    ]
                }
            },
            // setup application js libraries and angular directives
            app: {
                src: [
                    'client/app/module.prefix',
                    // application with components
                    'client/app/**/*.js',
                    'client/components/**/*.js',
                    // ignore tests
                    '!client/app/**/*.spec.js',
                    'client/app/module.suffix'
                ],
                dest: 'dist/js/application.js'
            },
            // all app css libraries
            appCss: {
                files: {
                    'dist/css/application.css': [
                        'client/app/**/*.css'
                    ]
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            target: {
                files: {
                    'dist/js/application.js': 'dist/js/application.js',
                    'dist/js/angular.js': 'dist/js/libs.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'dist/css/application.css': ['dist/css/application.css']
                }
            }
        },
        server: {
            script: 'scripts/web-server.js'
        },
        livereload: {
            port: 35729 // Default livereload listening port.
        },
        // Configuration to be run (and then tested)
        regarde: {
            client: {
                files: ['client/**/*.*', 'client/*.*', '!client/**/*.spec.js'],
                tasks: ['build:regarde', 'livereload']
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
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@livereload-->', to: ''}

                ]
            },
            livereload: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@livereload-->', to: '<script src="http://localhost:<%=livereload.port%>/livereload.js?snipver=1"></script>'}
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
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Tasks
    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'concat',
        'replace:debug'
    ]);
    grunt.registerTask('build:regarde', [
        'clean:dist',
        'copy',
        'concat',
        'replace:livereload'
    ]);
    grunt.registerTask('lint', [
        'clean:reports',
        'jshint:files'
    ]);
    grunt.registerTask('test', [
        'clean:reports',
        'jshint:files',
        'karma'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'concat',
        'uglify',
        'replace:release'
    ]);
    grunt.registerTask('server', [
        'clean:dist',
        'copy',
        'concat',
        'livereload-start',
        'express-server',
        'replace:livereload',
        'open:server',
        'regarde'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};