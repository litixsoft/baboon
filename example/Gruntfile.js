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
            reports: ['test/reports'],
            dist: ['dist','tmp']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'client/app/**/*.js','client/common/**/*.js','test/e2e/**/*.js'],
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
                    angular: true,
                    io: true
                }
            }
        },

        /**
         * `grunt copy` just copies files from client or vendor to dist.
         */
        copy: {
            client: {
                // all client files that need to be copy.
                files: [
                    {dest: 'dist/', src : ['*.*'], expand: true, cwd: 'client/'},
                    {dest: 'dist', src : ['**','!README.md'], expand: true, cwd: 'client/assets'}
                ]
            },
            vendor: {
                // all vendor files that need to be copy.
                files: [
                    { dest: 'dist/img', src : ['**'], expand: true, cwd: 'vendor/bootstrap/img/' }
                ]
            }
        },
        html2js: {
            options: {
                // custom options, see below
                base: 'client/app'
            },
            main: {
                src: ['client/app/**/*.html', 'client/common/**/*.html'],
                dest: 'tmp/app.tpl.js'
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
                        'vendor/jquery/jquery.min.js',
                        'vendor/jquery-ui/js/jquery-ui-1.10.2.custom.min.js', //draggable für calendar
                        'vendor/jquery-codemirror/codemirror.js',

                        'vendor/angular/angular.min.js',
                        'vendor/bootstrap/js/bootstrap.min.js',
//                        'vendor/angular-ui-bootstrap/ui-bootstrap-0.2.0.min.js', //überflüssig
                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.2.0.min.js',

                        'vendor/angular-ui/js/angular-ui.min.js',
                        'vendor/angular-strap/angular-strap.js',


                        'vendor/kendo-ui/kendo.all.min.js',
                        'vendor/underscore/underscore-min.js',
                        'vendor/angular-kendo/angular-kendo.js',

                        'vendor/bootstrap/js/datepicker/bootstrap-datepicker.js',
                        'vendor/bootstrap/js/timepicker/bootstrap-timepicker.js',

                        'vendor/jquery-ui/jquery-ui-fullcalendar/fullcalendar.min.js',
                        'vendor/jquery-ui/jquery-ui-fullcalendar/gcal.js',
                        'vendor/select2/select2.min.js',

                        'vendor/angular-ui-ng-grid/ng-grid.js'

                    ]
                }
            },
            /**
             * The `libsCss` target is for all third-party css files we need to include
             * in the final distribution.
             */
            libsCss: {
                files: {
                    'dist/css/libs.css': [
                        'vendor/bootstrap/css/bootstrap.min.css',
                        'vendor/bootstrap/css/bootstrap-responsive.min.css',
                        //AngularUI
                        'vendor/angular-ui/js/angular-ui.min.css',
                        'vendor/jquery-ui/css/ui-lightness/jquery-ui-1.10.2.custom.min.css',
                        'vendor/jquery-codemirror/codemirror.css',
                        'vendor/jquery-codemirror/theme/monokai.css',
                        //AngularStrap
                        'vendor/bootstrap/js/datepicker/bootstrap-datepicker.css',
                        'vendor/jquery-ui/jquery-ui-fullcalendar/fullcalendar.css',
                        'vendor/select2/select2.css',

                        'vendor/angular-ui-ng-grid/ng-grid.css'
                    ]
                }
            },
            // setup application js libraries and angular directives
            app: {
                src: [
                    'client/app/module.prefix',
                    'client/app/**/*.js',
                    '!client/app/**/*.spec.js',
                    'client/common/**/*.js',
                    '!client/common/**/*.spec.js',
                    'client/components/**/*.js',
                    'tmp/app.tpl.js',
                    'client/app/module.suffix'
                ],
                dest: 'dist/js/application.js'
            },
            // all app css libraries
            appCss: {
                files: {
                    'dist/css/application.css': [
                        'client/common/**/*.css',
                        'client/app/**/*.css'
                    ]
                }
            }
        },
        ngmin: {
            app: {
                src: ['dist/js/application.js'],
                dest: 'dist/js/application.js'
            }
        },
        uglify: {
            target: {
                files: {
                    'dist/js/application.js': 'dist/js/application.js'
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
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            }
        },
        replace: {
            debug: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=livereload.port%>/livereload.js?snipver=1"></script>'}
                ]
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
            },
            e2e: {
                configFile: 'config/karma-e2e.conf.js'
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
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-ngmin');

    // Tasks
    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:debug'
    ]);
    grunt.registerTask('build:regarde', [
        'clean:dist',
        'copy',
        'html2js',
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
        'karma:unit'
    ]);
    grunt.registerTask('e2e', [
        'clean:reports',
        'jshint:files',
        'karma:e2e'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'ngmin',
        'uglify',
        'replace:release'
    ]);
    grunt.registerTask('server', [
        'clean:dist',
        'copy',
        'html2js',
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