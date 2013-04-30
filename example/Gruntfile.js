'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
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
            dist: ['build/dist','build/tmp']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'client/app/**/*.js','client/common/**/*.js','test/e2e/**/*.js'],
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
                    {dest: 'build/dist/', src : ['*.*'], expand: true, cwd: 'client/'},
                    {dest: 'build/dist/assets', src : ['**','!README.md'], expand: true, cwd: 'client/assets'},
                    {dest: 'build/dist/views/', src : ['**/views/*.html'], expand: true, cwd: 'client/app/'}
                ]
            },
            vendor: {
                // all vendor files that need to be copy.
                files: [
                    // bootstrap images to core
//                    { dest: 'build/dist/assets/core/img', src : ['**'], expand: true, cwd: 'vendor/bootstrap/img/' },
                    // vendor to assets
                    { dest: 'build/dist/assets/jquery', src : ['**'], expand: true, cwd: 'vendor/jquery' },
                    {
                        dest: 'build/dist/assets/angular',
                        src : ['angular.js','angular.min.js'],
                        expand: true,
                        cwd: 'vendor/angular'
                    },
                    { dest: 'build/dist/assets/bootstrap', src : ['**'], expand: true, cwd: 'vendor/bootstrap' },
                    { dest: 'build/dist/assets/angular-ui-bootstrap', src : ['*-tpls-*'], expand: true, cwd: 'vendor/angular-ui-bootstrap' },
                    { dest: 'build/dist/assets/jquery-ui', src : ['**'], expand: true, cwd: 'vendor/jquery-ui' },
                    { dest: 'build/dist/assets/jquery-codemirror', src : ['**'], expand: true, cwd: 'vendor/jquery-codemirror' }
                ]
            }
        },
        /**
         * html2js for common templates
         */
        html2js: {
            options: {
                // custom options, see below
                base: 'client/common'
            },
            main: {
                src: ['client/common/**/*.html'],
                dest: 'build/tmp/common.tpl.js'
            }
        },
        concat: {
            /**
             * The `core` target is for baboon core third-party js libraries.
             */
            core: {
                files: {
                    'build/dist/assets/core/js/core.js': [
                        'vendor/jquery/jquery.js',
                        'vendor/angular/angular.js',
                        'vendor/bootstrap/js/bootstrap.js',
                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.2.0.js',
                        'vendor/angular-ui/js/angular-ui.js',
                        'vendor/angular-strap/angular-strap.js'
                    ],
                    'build/dist/assets/core/js/core.min.js': [
                        'vendor/jquery/jquery.min.js',
                        'vendor/angular/angular.min.js',
                        'vendor/bootstrap/js/bootstrap.min.js',
                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.2.0.min.js',
                        'vendor/angular-ui/js/angular-ui.min.js',
                        'vendor/angular-strap/angular-strap.min.js'
                    ],
                    'build/dist/assets/core/css/core.css': [
                        'vendor/bootstrap/css/bootstrap.css',
                        'vendor/bootstrap/css/bootstrap-responsive.css',
                        'vendor/angular-ui/js/angular-ui.css'
                    ],
                    'build/dist/assets/core/css/core.min.css': [
                        'vendor/bootstrap/css/bootstrap.min.css',
                        'vendor/bootstrap/css/bootstrap-responsive.min.css',
                        'vendor/angular-ui/js/angular-ui.min.css'
                    ]
                }
            },
            common: {
                files: {
                    'build/dist/assets/core/js/common.js': [
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',
                        'build/tmp/common.tpl.js'
                    ]
                }
            }
//            libs: {
//                files: {
//                    'build/dist/public/js/libs.js': [
//                        'vendor/jquery/jquery.min.js',
//                        'vendor/jquery-ui/js/jquery-ui-1.10.2.custom.min.js', //draggable für calendar
//                        'vendor/jquery-codemirror/codemirror.js',
//
//                        'vendor/angular/angular.min.js',
//                        'vendor/bootstrap/js/bootstrap.min.js',
////                        'vendor/angular-ui-bootstrap/ui-bootstrap-0.2.0.min.js', //überflüssig
//                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.2.0.min.js',
//
//                        'vendor/angular-ui/js/angular-ui.min.js',
//                        'vendor/angular-strap/angular-strap.js',
//
//                        'vendor/bootstrap/js/datepicker/bootstrap-datepicker.js',
//                        'vendor/bootstrap/js/timepicker/bootstrap-timepicker.js',
//
//                        'vendor/jquery-ui/jquery-ui-fullcalendar/fullcalendar.min.js',
//                        'vendor/jquery-ui/jquery-ui-fullcalendar/gcal.js',
//                        'vendor/select2/select2.min.js',
//
//                        'vendor/angular-ui-ng-grid/ng-grid.js',
//                        'vendor/kendo-ui/kendo.all.min.js',
//                        'vendor/angular-kendo/angular-kendo.js',
//
//                        // common
//                        'client/common/**/*.js',
//                        'build/tmp/common.tpl.js'
//
//                    ]
//                }
//            },
//            /**
//             * The `libsCss` target is for all third-party css files we need to include
//             * in the final distribution.
//             */
//            libsCss: {
//                files: {
//                    'build/dist/public/css/libs.css': [
//                        'vendor/bootstrap/css/bootstrap.min.css',
//                        'vendor/bootstrap/css/bootstrap-responsive.min.css',
//                        //AngularUI
//                        'vendor/angular-ui/js/angular-ui.min.css',
//                        'vendor/jquery-ui/css/ui-lightness/jquery-ui-1.10.2.custom.min.css',
//                        'vendor/jquery-codemirror/codemirror.css',
//                        'vendor/jquery-codemirror/theme/monokai.css',
//                        //AngularStrap
//                        'vendor/bootstrap/js/datepicker/bootstrap-datepicker.css',
//                        'vendor/jquery-ui/jquery-ui-fullcalendar/fullcalendar.css',
//                        'vendor/select2/select2.css',
//
//                        'vendor/angular-ui-ng-grid/ng-grid.css',
//
//                        // common
//                        'client/common/**/*.css'
//                    ]
//                }
//            }
            // setup application js libraries and angular directives
//            app: {
//                src: [
//                    'client/app/module.prefix',
//                    'client/app/**/*.js',
//                    '!client/app/**/*.spec.js',
//                    'build/tmp/app.tpl.js',
//                    'client/app/module.suffix'
//                ],
//                dest: 'build/dist/js/application.js'
//            },
//            // all app css libraries
//            appCss: {
//                files: {
//                    'build/dist/css/application.css': [
//                        'client/common/**/*.css',
//                        'client/app/**/*.css'
//                    ]
//                }
//            }
        },
        ngmin: {
            common: {
                src: ['build/dist/assets/core/js/common.js'],
                dest: 'build/tmp/common.js'
            }
//            app: {
//                src: ['build/dist/js/application.js'],
//                dest: 'build/dist/js/application.js'
//            }
        },
        uglify: {
            target: {
                files: {
                    'build/dist/assets/core/js/common.min.js': 'build/tmp/common.js'
                    //'build/dist/js/application.js': 'build/dist/js/application.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    //'build/dist/css/application.css': ['build/dist/css/application.css']
                }
            }
        },
        server: {
            script: 'app.js'
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
                src: ['build/dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['build/dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['build/dist/index.html'],
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

    grunt.registerTask('build', [
        'clean:dist',
        'copy'
    ]);

    // Tasks
//    grunt.registerTask('build', [
//        'clean:dist',
//        'copy',
//        'html2js',
//        'concat',
//        'replace:debug'
//    ]);
//    grunt.registerTask('build:regarde', [
//        'clean:dist',
//        'copy',
//        'html2js',
//        'concat',
//        'replace:livereload'
//    ]);
//    grunt.registerTask('lint', [
//        'clean:reports',
//        'jshint:files'
//    ]);
//    grunt.registerTask('test', [
//        'clean:reports',
//        'jshint:files',
//        'karma'
//    ]);
//    grunt.registerTask('release', [
//        'clean:dist',
//        'copy',
//        'html2js',
//        'concat',
//        'ngmin',
//        'uglify',
//        'replace:release'
//    ]);
//    grunt.registerTask('server', [
//        'clean:dist',
//        'copy',
//        'html2js',
//        'concat',
//        'livereload-start',
//        'express-server',
//        'replace:livereload',
//        'open:server',
//        'regarde'
//    ]);
//
//    // Default task.
//    grunt.registerTask('default', ['build']);
};