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
                    {dest: 'build/dist/', src : ['**','!README.md'], expand: true, cwd: 'client/assets/'},
                    {dest: 'build/dist/views/', src : ['**/views/*.html'], expand: true, cwd: 'client/app/'}
                ]
            },
            vendor: {
                // all vendor files that need to be copy.
                files: [
                    // all vendor without angular-locale
                    {dest: 'build/dist/assets/', src : ['**/*.*','!angular-locale/**'], expand: true, cwd: 'vendor/'}
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

        /**
         * concat files
         */

        concat: {
            /**
             * The `locale` target is for angular-locale js libraries.
             */
            locale: {
                files: {
                    'build/dist/js/locale.js': [
                        'vendor/angular-locale/*_de*',
                        'vendor/angular-locale/*_en*}'
                    ]
                }
            },
            /**
             * The `common` target is for baboon common js libraries.
             */
            common: {
                files: {
                    'build/dist/js/common.js': [
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',
                        'build/tmp/common.tpl.js'
                    ]
                }
            },
            /**
             * The `app` target is for application js libraries.
             */
            app: {
                files: {
                    'build/dist/js/app.js': [
                        'client/app/module.prefix',
                        'client/app/**/*.js',
                        '!client/app/**/*.spec.js',
                        'client/app/module.suffix'
                    ]
                }
            },

            /**
             * all app css libraries
             */
            appCss: {
                files: {
                    'build/dist/css/app.css': ['client/app/**/*.css']
                }
            }
        },

        /**
         * prepare uglify with ngmin only for angular stuff
         */

        ngmin: {
            // angular locale
            locale: {
                src: ['build/dist/js/locale.js'],
                dest: 'build/tmp/locale.js'
            },
            // application common
            common: {
                src: ['build/dist/js/common.js'],
                dest: 'build/tmp/common.js'
            },
            app: {
                src: ['build/dist/js/app.js'],
                dest: 'build/tmp/app.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/js/locale.min.js': 'build/tmp/locale.js',
                    'build/dist/js/common.min.js': 'build/tmp/common.js',
                    'build/dist/js/app.min.js': 'build/tmp/app.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            target: {
                files: {
                    'build/dist/css/app.min.css': ['build/dist/css/app.css']
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
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['build/dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['build/dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
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
        'karma'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'ngmin',
        'uglify',
        'cssmin',
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