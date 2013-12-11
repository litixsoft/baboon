'use strict';

var lxHelpers = require('lx-helpers');

module.exports = function (grunt) {
    var path = require('path');

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    /**
     * Gets the index.html file from the code coverage folder.
     *
     * @param {!string} folder The path to the code coverage folder.
     */
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

        // load package.json config file
        pkg: grunt.file.readJSON('package.json'),

        // load app.conf.json
        conf: grunt.file.readJSON('config/app.conf.json').base,

        // config files and folders

        // build folder
        buildFolder: 'build',
        buildDistFolder: '<%= buildFolder %>/dist',
        buildReportsFolder: '<%= buildFolder %>/reports',
        buildTmpFolder: '<%= buildFolder %>/tmp',
        buildDistPublicFolder: '<%= buildDistFolder %>/public',
        buildDistPublicVendorFolder: '<%= buildDistPublicFolder %>/vendor',
        buildDistAppFolder: '<%= buildDistFolder %>/app',

        // client folder
        clientFolder: 'client',
        clientAppFolder: '<%= clientFolder %>/app',
        clientModulesFolder: '<%= clientFolder %>/modules',
        clientPublicFolder: '<%= clientFolder %>/public',
        clientVendorFolder: '<%= clientFolder %>/vendor',
        clientVendorBaboonFolder: '<%= clientVendorFolder %>/baboon-client',

        // server folder
        serverFolder: 'server',

        // config folder
        configFolder: 'config',

        // test folder
        testFolder: 'test',

        // scripts folder
        scriptsFolder: 'scripts',

        // js module prefix and suffix for concat
        module_prefix: '(function (window, angular, undefined) {\n    \'use strict\';\n\n',
        module_suffix: '\n})(window, window.angular);',

        // banner for created files
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',

        // files for jshint
        jshintFiles: [
            '*.js',
            '<%= clientFolder %>/**/*.js',
            '!<%= clientVendorFolder %>/**/*.js',
            '!<%= clientPublicFolder %>/**/*.js',
            '<%= serverFolder %>/**/*.js',
            '<%= testFolder %>/**/*.js',
            '<%= configFolder %>/**/*.js',
            '<%= scriptsFolder %>/**/*.js',
            '!<%= clientModulesFolder %>/**/*.js'
        ],

        // config tasks

        // Before generating any new files, remove any previously-created files.
        clean: {
            jshint: ['<%= buildReportsFolder %>/lint'],
            dist: ['<%= buildDistFolder %>'],
            jasmine: ['<%= buildReportsFolder %>/tests/server'],
            karma: ['<%= buildReportsFolder %>/tests/client'],
            coverageServer: ['<%= buildReportsFolder %>/coverage/server'],
            coverageClient: ['<%= buildReportsFolder %>/coverage/client'],
            reports: ['<%= buildReportsFolder %>'],
            tmp: ['<%= buildTmpFolder %>']
        },

        // lint files
        jshint: {
            options: {
                jshintrc: true
            },
            test: '<%= jshintFiles %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: '<%= buildReportsFolder %>/lint/jshint.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '<%= buildReportsFolder %>/lint/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshintFiles %>'
                }
            }
        },

        // just copies files from client or vendor to dist.
        copy: {
            app: {
                files: [
                    {
                        // copy all from client/app folder without js, less and html files to dist public
                        dest: '<%= buildDistPublicFolder %>',
                        src: ['**/*.*', '!**/*.js', '!**/*.json', '!**/*.less', '!**/*.html', '!**/*.md'],
                        expand: true,
                        cwd: '<%= clientAppFolder %>'
                    },
                    {
                        // copy all index.html files as toplevel apps
                        dest: '<%= buildDistAppFolder %>',
                        src: ['**/index.html'],
                        expand: true,
                        cwd: '<%= clientAppFolder %>'
                    },
                    {
                        // copy public
                        dest: '<%= buildDistPublicFolder %>',
                        src: ['**'],
                        expand: true,
                        cwd: '<%= clientFolder %>/public/'
                    }
                ]
            },
            vendor: {
                files: [
                    {
                        // angular
                        dest: '<%= buildDistPublicVendorFolder %>/angular',
                        src: ['*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/angular/'
                    },
                    {
                        // angular-animate
                        dest: '<%= buildDistPublicVendorFolder %>/angular-animate',
                        src: ['*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/angular-animate/'
                    },
                    {
                        // angular-route
                        dest: '<%= buildDistPublicVendorFolder %>/angular-route',
                        src: ['*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/angular-route/'
                    },
                    {
                        // bootstrap dist
                        dest: '<%= buildDistPublicVendorFolder %>/bootstrap',
                        src: ['**/*.*', '!**/*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/bootstrap/dist/'
                    },
                    {
                        // angular-bootstrap  src: ['**/*-tpls.*'],  cwd: '<%= clientVendorFolder %>/angular-bootstrap/'
                        dest: '<%= buildDistPublicVendorFolder %>/angular-ui-bootstrap',
                        src: ['**/*-tpls-0.6.0*'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/angular-ui-bootstrap/'
                    },
                    {
                        // bootstrap assets
                        dest: '<%= buildDistPublicFolder %>',
                        src: ['**/*.png'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/bootstrap/assets/'
                    },
                    {
                        // baboon-client public
                        dest: '<%= buildDistPublicFolder %>',
                        src: ['**/*.*'],
                        expand: true,
                        cwd: '<%= clientVendorBaboonFolder %>/public/'
                    },
                    {
                        // showdown
                        dest: '<%= buildDistPublicVendorFolder %>/showdown',
                        src: ['**/*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/showdown/'
                    },
                    {
                        // angular-highlight
                        dest: '<%= buildDistPublicVendorFolder %>/angular-highlightjs',
                        src: ['*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/angular-highlightjs/'
                    },
                    {
                        // highlightjs
                        dest: '<%= buildDistPublicVendorFolder %>/highlightjs',
                        src: ['highlight.pack.js', 'styles/arta.css', 'styles/default.css', 'styles/github.css'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/highlightjs/'
                    },
                    {
                        // highlightjs
                        dest: '<%= buildDistPublicVendorFolder %>/chroma-js',
                        src: ['**/*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/chroma-js/'
                    },
                    {
                        // highlightjs
                        dest: '<%= buildDistPublicVendorFolder %>/d3',
                        src: ['**/*.js'],
                        expand: true,
                        cwd: '<%= clientVendorFolder %>/d3/'
                    }
                ]
            }
        },

        /**
         * Baboon build
         * The Baboon build process overwrites all configuration settings for concat, html2js,
         * ngmin, uglify and less outside this range. These tasks can be configured only in this area.
         */
        baboon: {

            /**
             * Builds the templates from baboon.common and client.common.
             * The Baboon build expanded this configuration with the templates from baboon-client.
             * In addition, baboon-build expanded this configuration with the application templates.
             * Baboon-build uses the prefixes bb_ *.
             */
            html2js: {
            },

            /**
             * The concat configuration overwrite dynamically by baboon-build with the prefixes bb_ *.
             * Currently you can only adjust the base here. Extending concat is not yet possible.
             */
            concat: {
                /**
                 * The basis for all applications will be inserted into any application.
                 * The dest is generated dynamically from baboon build.
                 * Here is regulated, what all should be included in the application.
                 */
                base: {
                    options: {
                        banner: '<%= banner %>\n<%= module_prefix %>',
                        footer: '<%= module_suffix %>'
                    },
                    src: [
                        '<%= clientVendorFolder %>/angular-ui-utils/modules/*.js',
                        '<%= clientVendorFolder %>/angular-ui-utils/modules/**/*.js',
                        '!<%= clientVendorFolder %>/angular-ui-utils/modules/**/*Spec.js',
                        '<%= clientVendorFolder %>/angular-translate/angular-translate.js',
                        '<%= clientVendorFolder %>/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
                    ]
                }
            },

            /**
             * The includes for all applications. The optional includes from app.conf.json are added by baboon-build.
             * This Includes Angular needed for injection. Use here the correct module name.
             */
            includes: {
                concat: [
                    'ui.utils',
                    'pascalprecht.translate'
                ],
                system: [
                    'lib.templates',
                    'client.templates',
                    'app.templates'
                ],
                modules: [
                    'lx.alert',
                    'lx.auth',
                    'lx.datepicker',
                    'lx.float',
                    'lx.integer',
                    'lx.modal',
                    'lx.nav',
                    'lx.session',
                    'lx.transport',
                    'lx.socket',
                    'lx.rest'
                ]
            },

            /**
             * Less configuration skeleton. Baboon-build to insert the application less files.
             * You can simply insert your configurations here.
             */
            less: {
                debug: {
                    files: {}
                },
                release: {
                    options: {
                        yuicompress: true
                    },
                    files: {}
                }
            },

            /**
             * ngmin configuration skeleton. Baboon-build is to insert all the javascript files of the application.
             * You can simply insert your configurations here.
             */
            ngmin: {},

            /**
             * uglify configuration skeleton. Baboon-build is to insert all the javascript files of the application.
             * You can simply insert your configurations here.
             */
            uglify: {
                target: {
                    files: {}
                }
            }
        },

        // commandline
        bgShell: {
            e2e: {
                cmd: 'node test/fixtures/resetDB.js e2e'
            },
            setup: {
                cmd: 'node <%= scriptsFolder %>/setup.js'
            },
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir <%= buildReportsFolder %>/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root <%= buildReportsFolder %>/coverage/server --dir <%= buildReportsFolder %>/coverage/server cobertura'
            }
        },

        // express server
        express: {
            dev: {
                options: {
                    port: 3000,
                    script: 'app.js',
                    delay: 1
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
                livereload: 35729,
                forever: false
            },
            client: {
                files: [
                    '<%= clientFolder %>/**/*.*',
                    '!<%= clientFolder %>/**/*.spec.js',
                    '!<%= clientVendorFolder %>/**/*.*'
                ],
                tasks: ['build:watch']
            },
            server: {
                files: [
                    '<%= serverFolder %>/modules/**/*.*',
                    '!<%= serverFolder %>/**/*.spec.js',
                    '<%= configFolder %>/app.conf.json',
                    '<%= configFolder %>/navigation.js',
                    'app.js'
                ],
                tasks: ['build:rights', 'express:dev', 'wait'],
                options: {
                    spawn: false //Without this option specified express won't be reloaded
                }
            }
        },

        // open browser
        open: {
            browser: {
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            },
            coverageServer: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/server/'))
            },
            coverageClient: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/client/'))
            }
        },

        // replacements in app index files
        replace: {
            debug: {
                src: ['<%= buildDistAppFolder %>/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['<%= buildDistAppFolder %>/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['<%= buildDistAppFolder %>/**/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {
                        from: '<!--@@livereload-->',
                        to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                            '<%=watch.options.livereload%>/livereload.js?snipver=1"></script>'
                    }
                ]
            }
        },

        // karma client tests
        karma: {
            unit: {
                configFile: '<%= configFolder %>/karma.conf.js'
            },
            ci: {
                configFile: '<%= configFolder %>/karma.conf.js',
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/tests/client/karma.xml',
                    suite: 'karma'
                }
            },
            debug: {
                configFile: '<%= configFolder %>/karma.conf.js',
                detectBrowsers: {
                    enabled: false
                },
                singleRun: false
            },
            coverage: {
                configFile: '<%= configFolder %>/karma.coverage.conf.js'
            },
            cobertura: {
                configFile: '<%= configFolder %>/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: '<%= buildReportsFolder %>/coverage/client'
                }
            },
            e2e: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js'
            },
            e2e_chrome: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js'
            },
            e2e_chrome_canary: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js',
                browsers: ['ChromeCanary'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/jasmine/chrome_canary.xml',
                    suite: 'ChromeCanary'
                }
            },
            e2e_firefox: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js',
                browsers: ['Firefox'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/jasmine/firefox.xml',
                    suite: 'Firefox'
                }
            },
            e2e_safari: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js',
                browsers: ['Safari'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/jasmine/safari.xml',
                    suite: 'Safari'
                }
            },
            e2e_ie: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js',
                browsers: ['IE'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/jasmine/ie.xml',
                    suite: 'IE'
                }
            },
            e2e_phantom: {
                configFile: '<%= configFolder %>/karma.e2e.conf.js',
                browsers: ['PhantomJS'],
                junitReporter: {
                    outputFile: '<%= buildReportsFolder %>/jasmine/phantomJS.xml',
                    suite: 'PhantomJS'
                }
            }
        },

        // jasmine server tests
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: '<%= testFolder %>',
            requirejs: false,
            forceExit: true,
            verbose: false,
            jUnit: {
                report: true,
                savePath: '<%= buildReportsFolder %>/tests/server/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Register tasks.

    // baboon build task
    grunt.registerTask('baboon', 'Baboon build helper.', function (arg1) {

        // release flag
        var release = false;

        // check release argument
        if (arg1 === 'release') {
            grunt.log.writeln('baboon task running in release mode, file minification');
            release = true;
        }
        else {
            grunt.log.writeln('baboon task running in develop mode, no file minification');
        }

        // buildHelper
        var buildHelper = require('../lib/buildHelper')(__dirname, grunt.config.data.baboon);

        // write include files for app
        lxHelpers.objectForEach(buildHelper.fileContents, function (key, value) {
            grunt.file.write('build/tmp/includes/' + key + '.js', value);
        });

        // append concat, ngmin, uglify and less config
        grunt.config.data.concat = buildHelper.concatConfig;
        grunt.config.data.html2js = buildHelper.html2jsConfig;
        grunt.config.data.ngmin = buildHelper.ngminConfig;
        grunt.config.data.uglify = buildHelper.uglifyConfig;
        grunt.config.data.less = buildHelper.lessConfig;

        // start concat
        grunt.task.run('html2js');
        grunt.task.run('concat');

        // if release mode, start ngmin
        if (release) {
            grunt.task.run('ngmin');
            grunt.task.run('uglify');
            grunt.task.run('less:release');
        }
        else {
            grunt.task.run('less:debug');
        }
    });

    // task that simply waits for 1 second, usefull for livereload
    grunt.registerTask('wait', function () {
        grunt.log.ok('Waiting...');

        var done = this.async();

        setTimeout(function() {
            grunt.log.writeln('Done waiting!');
            done();
        }, 2000);
    });

    grunt.registerTask('build:rights', [
        'bgShell:setup'
    ]);
    grunt.registerTask('build:client', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'baboon',
        'replace:debug'
    ]);
    grunt.registerTask('build', [
        'build:rights',
        'build:client'
    ]);
    grunt.registerTask('build:watch', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'baboon',
        'replace:livereload'
    ]);
    grunt.registerTask('build:deploy', [
        'clean:dist',
        'clean:tmp',
        'copy',
        'baboon:release',
        'build:rights',
        'replace:release'
    ]);
    grunt.registerTask('lint', [
        'jshint:test'
    ]);
    grunt.registerTask('test:unit', [
        'clean:jasmine',
        'clean:tmp',
        'baboon:html2js',
        'jshint:test',
        'jasmine_node',
        'karma:unit'
    ]);
    grunt.registerTask('debug', [
        'karma:debug'
    ]);
    grunt.registerTask('test:client', [
        'clean:tmp',
        'baboon:html2js',
        'jshint:test',
        'karma:unit'
    ]);
    grunt.registerTask('cover:client', [
        'clean:coverageClient',
        'clean:tmp',
        'baboon:html2js',
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
        'clean:tmp',
        'baboon:html2js',
        'jshint:test',
        'bgShell:coverage',
        'karma:coverage',
        'open:coverageServer',
        'open:coverageClient'
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
        'build:deploy',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test', [
//        'bgShell:e2e',
        'clean:jasmine',
        'clean:tmp',
        'jshint:test',
        'jasmine_node',
        'build',
        'karma:unit'
        //'express:e2e',
        //'karma:e2e'
    ]);
    grunt.registerTask('test:release', [
        'bgShell:e2e',
        'clean:jasmine',
        'clean:tmp',
        'jshint:test',
        'jasmine_node',
        'build:deploy',
        'karma:unit'
        //'express:e2e',
        //'karma:e2e'
    ]);
    grunt.registerTask('server', [
        'build:rights',
        'build:watch',
        'express:dev',
        'wait',
        'open:browser',
        'watch'
    ]);
    grunt.registerTask('ci', [
        'clean',
        'build',
        'jshint:jslint',
        'jshint:checkstyle',
        'jasmine_node',
        'bgShell:coverage',
        'bgShell:cobertura',
        'karma:ci',
        'karma:coverage',
        'karma:cobertura'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};