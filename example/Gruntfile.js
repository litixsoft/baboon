'use strict';

module.exports = function (grunt) {

    var path = require('path');

    function getCoverageReport (folder) {
        var reports = grunt.file.expand(folder + '*/index.html');

        if (reports && reports.length > 0) {
            return reports[0];
        }

        return '';
    }

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
        bbc: '../lib_client',
        aui_tmp: 'build/tmp/lib_client/vendor/angular-ui-bootstrap/template',
        module_prefix: '(function (window, angular, undefined) {\n    \'use strict\';\n\n',
        module_suffix: '\n})(window, window.angular);',
        jshint_files_to_test: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/**/*.js', '!client/public/**/*.js',
            'test/**/*.js', '!test/lib/**/*.js', 'config/**/*.js'],
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            jshint: ['build/reports/jshint'],
            dist: ['build/dist', 'build/tmp'],
            jasmine: ['build/reports/jasmine'],
            coverageServer: ['build/reports/coverage/server'],
            coverageClient: ['build/reports/coverage/client'],
            tmp: ['build/tmp']
        },

        // lint files
        jshint: {
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
                loopfunc: true,
                browser: true,
                node: true,
                globals: {
                }
            },
            test: '<%= jshint_files_to_test %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: 'build/reports/jshint/jshint.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/jshint/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            }
        },

        /**
         * `grunt copy` just copies files from client or vendor to dist.
         */
        copy: {
            client: {
                files: [

                    // all public files
                    {dest: 'build/dist/public', src: ['**'], expand: true, cwd: 'client/public/'},

                    // all lib_client/module html files
                    {dest: 'build/dist/views', src: ['**/*.html'], expand: true, cwd: '<%= bbc %>/module/'},

                    // all app html files
                    {dest: 'build/dist/views/', src: ['**/*.html'], expand: true, cwd: 'client/app/'},

                    // all common html files
                    {dest: 'build/dist/views', src: ['**/*.html'], expand: true, cwd: 'client/common/'},

                    // all toplevel and partials html files
                    {dest: 'build/dist/views', src: ['**/*.html', '!app/**', '!common/**', '!public/**'], expand: true, cwd: 'client/'},

                    // all bootstrap image files that need to be copy.
                    {dest: 'build/dist/public/img/', src: ['**'], expand: true, cwd: '<%= bbc %>/vendor/bootstrap/img/'}
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
                    'build/dist/public/js/lib.js': [
                        '<%= bbc %>/vendor/angular/angular.js',
                        '<%= bbc %>/vendor/showdown/src/showdown.js'
                        //'<%= bbc %>/vendor/showdown/src/extensions/github.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/prettify.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/table.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/twitter.js',
                    ],
                    // lib release
                    'build/dist/public/js/lib.min.js': [
                        '<%= bbc %>/vendor/angular/angular.min.js',
                        '<%= bbc %>/vendor/showdown/compressed/showdown.js'
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/github.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/prettify.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/table.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/twitter.js',
                    ],
                    // libs debug
                    'build/dist/public/css/lib.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.css',
                        '<%= bbc %>/css/default.css'
                    ],
                    // libs release
                    'build/dist/public/css/lib.min.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.min.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.min.css',
                        'build/tmp/default.min.css'
                    ]
                }
            },

            /**
             * The `app` target is for application js and css libraries.
             */
            app_js: {
                options: {
                    banner: '<%= module_prefix %>',
                    footer: '<%= module_suffix %>'
                },

                files: {
                    'build/dist/public/js/app.js': [
                        // ui-bootstrap
                        '<%= bbc %>/vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.7.0.js',

                        // ui-utils
                        '<%= bbc %>/vendor/angular-ui-utils/ui-utils.js',

                        // baboon.services
                        '<%= bbc %>/services/lx.cache.js',
                        '<%= bbc %>/services/lx.form.js',
                        '<%= bbc %>/services/lx.InlineEdit.js',
                        '<%= bbc %>/services/lx.session.js',
                        '<%= bbc %>/services/lx.socket.js',
                        '<%= bbc %>/services/lx.alert.js',

                        // baboon.directives
                        '<%= bbc %>/directives/lx.fileUpload.js',
                        '<%= bbc %>/directives/lx.float.js',
                        '<%= bbc %>/directives/lx.integer.js',
                        '<%= bbc %>/directives/lx.pager.js',
                        '<%= bbc %>/directives/lx.sort.js',
                        '<%= bbc %>/directives/ui.if.js',

                        // baboon.module
                        '<%= bbc %>/module/baboon_auth/baboon.auth.js',
                        '<%= bbc %>/module/baboon_auth/baboon.auth.services.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.directives.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.tpls.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.directives.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.tpls.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // app
                        'client/app/**/*.js',
                        '!client/app/**/*.spec.js'
                    ]
                }
            },
            app_css: {
                files: {
                    'build/dist/public/css/app.css': [
                        // app css files
                        'client/app/**/*.css'
                    ]
                }
            },

            /**
             * The `ui` target is for toplevel application js and css libraries.
             */
            ui_js: {
                options: {
                    banner: '<%= module_prefix %>',
                    footer: '<%= module_suffix %>'
                },

                files: {
                    'build/dist/public/js/ui_app.js': [
                        // ui-bootstrap
                        '<%= bbc %>/vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.7.0.js',

                        // ui-utils
                        '<%= bbc %>/vendor/angular-ui-utils/ui-utils.js',

                        // baboon.services
                        '<%= bbc %>/services/lx.cache.js',
                        '<%= bbc %>/services/lx.form.js',
                        '<%= bbc %>/services/lx.InlineEdit.js',
                        '<%= bbc %>/services/lx.session.js',
                        '<%= bbc %>/services/lx.socket.js',
                        '<%= bbc %>/services/lx.alert.js',

                        // baboon.directives
                        '<%= bbc %>/directives/lx.fileUpload.js',
                        '<%= bbc %>/directives/lx.float.js',
                        '<%= bbc %>/directives/lx.integer.js',
                        '<%= bbc %>/directives/lx.pager.js',
                        '<%= bbc %>/directives/lx.sort.js',
                        '<%= bbc %>/directives/ui.if.js',

                        // baboon.module
                        '<%= bbc %>/module/baboon_auth/baboon.auth.js',
                        '<%= bbc %>/module/baboon_auth/baboon.auth.services.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.directives.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.tpls.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.directives.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.tpls.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/toplevel/ui_examples/**/*.js',
                        '!client/toplevel/ui_examples/**/*.spec.js'
                    ]
                }
            },
            ui_css: {
                files: {
                    'build/dist/public/css/ui_app.css': [
                        // toplevel css
                        'client/toplevel/ui_examples/**/*.css'
                    ]
                }
            },

            /**
             * The `admin` target is for toplevel application js and css libraries.
             */
            admin_js: {
                options: {
                    banner: '<%= module_prefix %>',
                    footer: '<%= module_suffix %>'
                },
                files: {
                    'build/dist/public/js/admin_app.js': [
                        // ui-bootstrap
                        '<%= bbc %>/vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.7.0.js',

                        // ui-utils
                        '<%= bbc %>/vendor/angular-ui-utils/ui-utils.js',

                        // baboon.services
                        '<%= bbc %>/services/lx.cache.js',
                        '<%= bbc %>/services/lx.form.js',
                        '<%= bbc %>/services/lx.InlineEdit.js',
                        '<%= bbc %>/services/lx.session.js',
                        '<%= bbc %>/services/lx.socket.js',
                        '<%= bbc %>/services/lx.alert.js',

                        // baboon.directives
                        '<%= bbc %>/directives/lx.fileUpload.js',
                        '<%= bbc %>/directives/lx.float.js',
                        '<%= bbc %>/directives/lx.integer.js',
                        '<%= bbc %>/directives/lx.pager.js',
                        '<%= bbc %>/directives/lx.sort.js',
                        '<%= bbc %>/directives/ui.if.js',

                        // baboon.module
                        '<%= bbc %>/module/baboon_auth/baboon.auth.js',
                        '<%= bbc %>/module/baboon_auth/baboon.auth.services.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.directives.js',
                        '<%= bbc %>/module/baboon_msgBox/baboon.msgBox.tpls.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.directives.js',
                        '<%= bbc %>/module/baboon_nav/baboon.nav.tpls.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/toplevel/admin/**/*.js',
                        '!client/toplevel/admin/**/*.spec.js'
                    ]
                }
            },
            admin_css: {
                files: {
                    'build/dist/public/css/admin_app.css': [
                        // toplevel css
                        'client/toplevel/admin/**/*.css'
                    ]
                }
            }
        },

        /**
         * prepare uglify with ngmin only for angular stuff
         */

        ngmin: {
            app: {
                src: ['build/dist/public/js/app.js'],
                dest: 'build/tmp/app.js'
            },
            ui: {
                src: ['build/dist/public/js/ui_app.js'],
                dest: 'build/tmp/ui_app.js'
            },
            admin: {
                src: ['build/dist/public/js/admin_app.js'],
                dest: 'build/tmp/admin_app.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/public/js/app.min.js': 'build/tmp/app.js',
                    'build/dist/public/js/ui_app.min.js': 'build/tmp/ui_app.js',
                    'build/dist/public/js/admin_app.min.js': 'build/tmp/admin_app.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            pre_build: {
                files: {
                    'build/tmp/default.min.css': ['<%= bbc %>/css/default.css']
                }
            },
            build: {
                files: {
                    'build/dist/public/css/app.min.css': ['build/dist/public/css/app.css'],
                    'build/dist/public/css/ui_app.min.css': ['build/dist/public/css/ui_app.css'],
                    'build/dist/public/css/admin_app.min.css': ['build/dist/public/css/admin_app.css']
                }
            }
        },

        bgShell: {
            e2e: {
                cmd: 'node test/fixtures/resetDB.js e2e'
            },
            setup: {
                cmd: 'node scripts/setup.js'
            },
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/reports/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/reports/coverage/server --dir build/reports/coverage/server cobertura'
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

        // Configuration to be run (and then tested)
        watch: {
            options: {
                livereload: 35729
            },
            client: {
                files: ['client/**/*.*', 'client/*.*', '!client/**/*.spec.js'],
                tasks: ['build:watch']
            },
            server: {
                files: ['server/modules/**/*.*'],
                tasks: ['express:dev']
            }
        },

        open: {
            browser: {
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            },
            coverageServer: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/server/lcov-report/'))
            },
            coverageClient: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/client/'))
            }
        },

        replace: {
            debug: {
                src: ['build/dist/views/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['build/dist/views/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['build/dist/views/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=watch.options.livereload%>/livereload.js?snipver=1"></script>'}
                ]
            }
        },

        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
            },
            ci: {
                configFile: 'config/karma.conf.js',
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'build/reports/tests/karma.xml',
                    suite: 'karma'
                }
            },
            debug: {
                configFile: 'config/karma.conf.js',
                detectBrowsers: false,
                singleRun: false
            },
            coverage: {
                configFile: 'config/karma.coverage.conf.js'
            },
            cobertura: {
                configFile: 'config/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: 'build/reports/coverage/client'
                }
            },
            e2e: {
                configFile: 'config/karma.e2e.conf.js'
            },
            e2e_chrome: {
                configFile: 'config/karma.e2e.conf.js'
            },
            e2e_chrome_canary: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['ChromeCanary'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/chrome_canary.xml',
                    suite: 'ChromeCanary'
                }
            },
            e2e_firefox: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['Firefox'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/firefox.xml',
                    suite: 'Firefox'
                }
            },
            e2e_safari: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['Safari'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/safari.xml',
                    suite: 'Safari'
                }
            },
            e2e_ie: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['IE'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/ie.xml',
                    suite: 'IE'
                }
            },
            e2e_phantom: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['PhantomJS'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/phantomJS.xml',
                    suite: 'PhantomJS'
                }
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
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Tasks
    grunt.registerTask('setup', [
        'bgShell:setup'
    ]);
    grunt.registerTask('build', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'cssmin:pre_build',
        'concat',
        'setup',
        'replace:debug'
    ]);
    grunt.registerTask('build:watch', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'cssmin:pre_build',
        'concat',
        'setup',
        'replace:livereload'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'cssmin:pre_build',
        'concat',
        'setup',
        'ngmin',
        'uglify',
        'cssmin:build',
        'replace:release'
    ]);
    grunt.registerTask('lint', [
        'jshint:test'
    ]);
    grunt.registerTask('unit', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit'
    ]);
    grunt.registerTask('debug', [
        'karma:debug'
    ]);
    grunt.registerTask('test:client', [
        'jshint:test',
        'karma:unit'
    ]);
    grunt.registerTask('cover:client', [
        'clean:coverageClient',
        'jshint:test',
        'karma:coverage',
        'open:coverageClient'
    ]);
    grunt.registerTask('test:server', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node'
    ]);
    grunt.registerTask('cover:server', [
        'clean:coverageServer',
        'jshint:test',
        'bgShell:coverage',
        'open:coverageServer'
    ]);
    grunt.registerTask('cover', [
        'clean:coverageServer',
        'clean:coverageClient',
        'jshint:test',
        'bgShell:coverage',
        'karma:coverage'
    ]);
    grunt.registerTask('e2e', [
        'jshint:test',
        'bgShell:e2e',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('e2e:all', [
        'jshint:test',
        'bgShell:e2e',
        'build',
        'express:e2e',
        'karma:e2e_chrome',
        'bgShell:e2e',
        'karma:e2e_firefox',
        'bgShell:e2e',
        'karma:e2e_chrome_canary',
        'bgShell:e2e',
        'karma:e2e_phantom',
        'bgShell:e2e',
        'karma:e2e_safari',
        'bgShell:e2e',
        'karma:e2e_ie'
    ]);
    grunt.registerTask('e2e:release', [
        'jshint:test',
        'bgShell:e2e',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test', [
        'bgShell:e2e',
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test:release', [
        'bgShell:e2e',
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('server', [
        'build:watch',
        'express:dev',
        'open:browser',
        'watch'
    ]);
    grunt.registerTask('ci', [
        'clean',
        'build',
        'jshint:jslint',
        'jshint:checkstyle',
        'bgShell:coverage',
        'bgShell:cobertura',
        'jasmine_node',
        'karma:unit',
        'karma:coverage',
        'karma:cobertura'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};