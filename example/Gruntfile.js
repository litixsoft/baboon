'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
        libincludes: grunt.file.readJSON('config/lib.conf.json'),
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
            dist: ['build/dist', 'build/tmp']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js'],
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
                }
            }
        },

        /**
         * `grunt copy` just copies files from client or vendor to dist.
         */
        copy: {
            client: {
                files: [
                    // all public files that need to be copy.
                    {dest: 'build/dist/', src: ['**'], expand: true, cwd: 'client/public/'},
                    // all html views that need to be copy.
                    {
                        dest: 'build/dist/views/',
                        src: ['**/*.html'],
                        expand: true,
                        cwd: 'client/app/'
                    },
                    // all vendor files that need to be copy.
                    {dest: 'build/dist/img/', src: ['**'], expand: true, cwd: 'vendor/bootstrap/img/'}
                ]
            }
        },

        /**
         * concat files
         */

        concat: {
            /**
             * The `lib` target is for all third-party js libraries we need to include
             * in the final distribution.
             */
            lib: {
                files: {
                    // lib debug
                    'build/dist/js/lib.js': [
                        'vendor/angular/angular.js',
                        'vendor/baboon/utils.js',
                        '<%= libincludes.base.js %>'
                    ],
                    // lib release
                    'build/dist/js/lib.min.js': [
                        'vendor/angular/angular.min.js',
                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.3.0.min.js'
                        /*angular-ui-utils sind noch nicht als minimierte verfügbar*/
                    ],
                    // libs debug
                    'build/dist/css/lib.css': [
                        'vendor/bootstrap/css/bootstrap.css',
                        'vendor/bootstrap/css/bootstrap-responsive.css',
                        'vendor/baboon/default.css'
                    ],
                    // libs release
                    'build/dist/css/lib.min.css': [
                        'vendor/bootstrap/css/bootstrap.min.css',
                        'vendor/bootstrap/css/bootstrap-responsive.min.css',
                        'vendor/baboon/default.css'
                    ]
                }
            },
            /**
             * The `app` target is for application js and css libraries.
             */
            app: {
                files: {
                    'build/dist/js/app.js': [

                        // prefix
                        'client/module.prefix',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // app
                        'client/app/**/*.js',
                        '!client/app/**/*.spec.js',

                        // ! toplevel apps
                        '!client/app/ui_examples/**/*.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/css/app.css': [

                        // app css files
                        'client/app/**/*.css',

                        // ! toplevel css
                        '!client/app/ui_examples/**/*.css'
                    ]
                }
            },
            /**
             * The `ui` target is for toplevel application js and css libraries.
             */
            ui: {
                files: {
                    'build/dist/js/ui_app.js': [

                        // prefix
                        'client/module.prefix',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/app/ui_examples/**/*.js',
                        '!client/app/ui_examples/**/*.spec.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/css/ui_app.css': [

                        // toplevel css
                        'client/app/ui_examples/**/*.css'
                    ]
                }
            }
        },

        /**
         * prepare uglify with ngmin only for angular stuff
         */

        ngmin: {
            app: {
                src: ['build/dist/js/app.js'],
                dest: 'build/tmp/app.js'
            },
            ui: {
                src: ['build/dist/js/ui_app.js'],
                dest: 'build/tmp/ui_app.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/js/app.min.js': 'build/tmp/app.js',
                    'build/dist/js/ui_app.min.js': 'build/tmp/ui_app.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            target: {
                files: {
                    'build/dist/css/app.min.css': ['build/dist/css/app.css'],
                    'build/dist/css/ui_app.min.css': ['build/dist/css/ui_app.css']
                }
            }
        },

        bgShell:{
            e2e: {
                cmd: 'node test/fixtures/resetDB.js e2e'
            }
        },

        express: {
            dev: {
                options: {
                    port: 3000,
                    script: 'app.js'
                }
            },
            e2e: {
                options: {
                    args: ['e2e'],
                    script: 'app.js'
                }
            }
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
                files: ['server/api/**/*.*', 'server/controllers/**/*.*', 'server/repositories/**/*.*'],
                tasks: ['express:dev', 'livereload']
            }
        },
        open: {
            browser: {
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            }
        },
        replace: {
            debug: {
                src: ['build/dist/*.html', 'build/dist/js/lib.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''},
                    {from: '<!--@@baseInjects-->', to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                            '"<%= libincludes.base.injects[i] %>"' +
                        '<% if((i+1) < libincludes.base.injects.length) { %>' +
                        ',' +
                        '<% } %>' +
                        '<% } %>'}
                ]
            },
            release: {
                src: ['build/dist/*.html', 'build/dist/js/lib.min.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''},
                    {from: '<!--@@baseInjects-->', to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                        '"<%= libincludes.base.injects[i] %>"' +
                        '<% if((i+1) < libincludes.base.injects.length) { %>' +
                        ',' +
                        '<% } %>' +
                        '<% } %>'}
                ]
            },
            livereload: {
                src: ['build/dist/*.html', 'build/dist/js/lib.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=livereload.port%>/livereload.js?snipver=1"></script>'},
                    {from: '<!--@@baseInjects-->', to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                        '"<%= libincludes.base.injects[i] %>"' +
                        '<% if((i+1) < libincludes.base.injects.length) { %>' +
                        ',' +
                        '<% } %>' +
                        '<% } %>'}
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
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: 'build/reports/jasmine/',
                useDotNotation: true,
                consolidate: true
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
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-bg-shell');

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
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'concat',
        'ngmin',
        'uglify',
        'cssmin',
        'replace:release'
    ]);
    grunt.registerTask('lint', [
        'clean:reports',
        'jshint:files'
    ]);
    grunt.registerTask('unit', [
        'clean:reports',
        'jasmine_node',
        'karma:unit'
    ]);
    grunt.registerTask('e2e', [
        'bgShell:e2e',
        'clean:reports',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('e2e:release', [
        'bgShell:e2e',
        'clean:reports',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test', [
        'bgShell:e2e',
        'clean:reports',
        'jshint:files',
        'jasmine_node',
        'karma:unit',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test:release', [
        'clean:reports',
        'jshint:files',
        'karma:unit',
        'release',
        'express:dev',
        'karma:e2e'
    ]);
    grunt.registerTask('server', [
        'clean:dist',
        'copy',
        'concat',
        'replace:livereload',
        'livereload-start',
        'express:dev',
        'open',
        'regarde'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};