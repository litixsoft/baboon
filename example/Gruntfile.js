'use strict';

module.exports = function (grunt) {

    var path = require('path'),
        browsers = [
            {
                name: 'Chrome',
                DEFAULT_CMD: {
                    linux: ['google-chrome'],
                    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
                    win32: [
                        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                        process.env.ProgramW6432 + '\\Google\\Chrome\\Application\\chrome.exe',
                        process.env.ProgramFiles + '\\Google\\Chrome\\Application\\chrome.exe',
                        process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
                    ]
                },
                ENV_CMD: 'CHROME_BIN'
            },
            {
                name: 'ChromeCanary',
                DEFAULT_CMD: {
                    linux: ['google-chrome-canary'],
                    darwin: ['/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'],
                    win32: [
                        process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe',
                        process.env.ProgramW6432 + '\\Google\\Chrome SxS\\Application\\chrome.exe',
                        process.env.ProgramFiles + '\\Google\\Chrome SxS\\Application\\chrome.exe',
                        process.env['ProgramFiles(x86)'] + '\\Google\\Chrome SxS\\Application\\chrome.exe'
                    ]
                },
                ENV_CMD: 'CHROME_CANARY_BIN'
            },
            {
                name: 'Firefox',
                DEFAULT_CMD: {
                    linux: ['firefox'],
                    darwin: ['/Applications/Firefox.app/Contents/MacOS/firefox-bin'],
                    win32: [
                        process.env.LOCALAPPDATA + '\\Mozilla Firefox\\firefox.exe',
                        process.env.ProgramW6432 + '\\Mozilla Firefox\\firefox.exe',
                        process.env.ProgramFiles + '\\Mozilla Firefox\\firefox.exe',
                        process.env['ProgramFiles(x86)'] + '\\Mozilla Firefox\\firefox.exe'
                    ]
                },
                ENV_CMD: 'FIREFOX_BIN'
            },
            {
                name: 'Safari',
                DEFAULT_CMD: {
                    darwin: ['/Applications/Safari.app/Contents/MacOS/Safari'],
                    win32: [
                        process.env.LOCALAPPDATA + '\\Safari\\Safari.exe',
                        process.env.ProgramW6432 + '\\Safari\\Safari.exe',
                        process.env.ProgramFiles + '\\Safari\\Safari.exe',
                        process.env['ProgramFiles(x86)'] + '\\Safari\\Safari.exe'
                    ]
                },
                ENV_CMD: 'SAFARI_BIN'
            },
            {
                name: 'IE',
                DEFAULT_CMD: {
                    win32: [
                        process.env.ProgramW6432 + '\\Internet Explorer\\iexplore.exe',
                        process.env.ProgramFiles + '\\Internet Explorer\\iexplore.exe',
                        process.env['ProgramFiles(x86)'] + '\\Internet Explorer\\iexplore.exe'
                    ]
                },
                ENV_CMD: 'IE_BIN'
            }
        ];

    function getCoverageReport (folder) {
        var reports = grunt.file.expand(folder + '*/index.html');

        if (reports && reports.length > 0) {
            return reports[0];
        }

        return '';
    }

    function getInstalledBrowsers (browsers) {
        var result = [];

        browsers.forEach(function (browser) {
            var browserPaths = browser.DEFAULT_CMD[process.platform] || [],
                i, length = browserPaths.length;

            for (i = 0; i < length; i++) {
                if (grunt.file.exists(browserPaths[i]) || process.env[browser.ENV_CMD] || grunt.file.exists(path.join('/', 'usr', 'bin', browserPaths[i]))) {
                    result.push(browser.name);

                    if (process.platform === 'win32' && !process.env[browser.ENV_CMD]) {
                        process.env[browser.ENV_CMD] = browserPaths[i];
                    }

                    return;
                }
            }
        });

        return result;
    }

    var availableBrowser = getInstalledBrowsers(browsers);

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
        bbc: 'node_modules/baboon-client',
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
            coverageClient: ['build/reports/coverage/client']
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
            test: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js'],
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: 'build/reports/jshint/jshint.xml'
                },
                files: {
                    src: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                        '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js']
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/jshint/jshint_checkstyle.xml'
                },
                files: {
                    src: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                        '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js']
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
                    {dest: 'build/dist/public', src: ['**', '!*.html'], expand: true, cwd: 'client/public/'},
                    // all toplevel app html files
                    {dest: 'build/dist/views', src: ['*.html'], expand: true, cwd: 'client/public/'},
                    // all common html files
                    {dest: 'build/dist/views', src: ['**/*.html'], expand: true, cwd: 'client/common/'},
                    // all html views that need to be copy.
                    {dest: 'build/dist/views/', src: ['**/*.html'], expand: true, cwd: 'client/app/'},
                    // all vendor files that need to be copy.
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
                        '<%= bbc %>/vendor/angular/angular.js'
                    ],
                    // lib release
                    'build/dist/public/js/lib.min.js': [
                        '<%= bbc %>/vendor/angular/angular.min.js'
                    ],
                    // libs debug
                    'build/dist/public/css/lib.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.css',
                        '<%= bbc %>/lib/css/default.css'
                    ],
                    // libs release
                    'build/dist/public/css/lib.min.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.min.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.min.css',
                        '<%= bbc %>/lib/css/default.min.css'
                    ]
                }
            },
            /**
             * The `app` target is for application js and css libraries.
             */
            app: {
                files: {
                    'build/dist/public/js/app.js': [

                        // prefix
                        'client/module.prefix',

                        // ui-bootstrap
                        '<%= bbc %>/vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.4.0.js',

                        // ui-utils
                        '<%= bbc %>/vendor/angular-ui-utils/event/event.js',
                        '<%= bbc %>/vendor/angular-ui-utils/format/format.js',
                        '<%= bbc %>/vendor/angular-ui-utils/highlight/highlight.js',
                        '<%= bbc %>/vendor/angular-ui-utils/if/if.js',
                        '<%= bbc %>/vendor/angular-ui-utils/indeterminate/indeterminate.js',
                        '<%= bbc %>/vendor/angular-ui-utils/inflector/inflector.js',
                        '<%= bbc %>/vendor/angular-ui-utils/jq/jq.js',
                        '<%= bbc %>/vendor/angular-ui-utils/keypress/keypress.js',
                        '<%= bbc %>/vendor/angular-ui-utils/mask/mask.js',
                        '<%= bbc %>/vendor/angular-ui-utils/reset/reset.js',
                        '<%= bbc %>/vendor/angular-ui-utils/route/route.js',
                        '<%= bbc %>/vendor/angular-ui-utils/scrollfix/scrollfix.js',
                        '<%= bbc %>/vendor/angular-ui-utils/showhide/showhide.js',
                        '<%= bbc %>/vendor/angular-ui-utils/unique/unique.js',
                        '<%= bbc %>/vendor/angular-ui-utils/validate/validate.js',

                        // baboon.services
                        '<%= bbc %>/lib/services/baboon-core.js',
                        '<%= bbc %>/lib/services/lx-form.js',
                        '<%= bbc %>/lib/services/lx-inline-edit.js',

                        // baboon.directives
                        '<%= bbc %>/lib/directives/lx-file-upload.js',
                        '<%= bbc %>/lib/directives/lx-float.js',
                        '<%= bbc %>/lib/directives/lx-integer.js',
                        '<%= bbc %>/lib/directives/lx-pager.js',
                        '<%= bbc %>/lib/directives/lx-sort.js',

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
                    'build/dist/public/css/app.css': [

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
                    'build/dist/public/js/ui_app.js': [

                        // prefix
                        'client/module.prefix',

                        // ui-bootstrap
                        '<%= bbc %>/vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.4.0.js',

                        // ui-utils
                        '<%= bbc %>/vendor/angular-ui-utils/event/event.js',
                        '<%= bbc %>/vendor/angular-ui-utils/format/format.js',
                        '<%= bbc %>/vendor/angular-ui-utils/highlight/highlight.js',
                        '<%= bbc %>/vendor/angular-ui-utils/if/if.js',
                        '<%= bbc %>/vendor/angular-ui-utils/indeterminate/indeterminate.js',
                        '<%= bbc %>/vendor/angular-ui-utils/inflector/inflector.js',
                        '<%= bbc %>/vendor/angular-ui-utils/jq/jq.js',
                        '<%= bbc %>/vendor/angular-ui-utils/keypress/keypress.js',
                        '<%= bbc %>/vendor/angular-ui-utils/mask/mask.js',
                        '<%= bbc %>/vendor/angular-ui-utils/reset/reset.js',
                        '<%= bbc %>/vendor/angular-ui-utils/route/route.js',
                        '<%= bbc %>/vendor/angular-ui-utils/scrollfix/scrollfix.js',
                        '<%= bbc %>/vendor/angular-ui-utils/showhide/showhide.js',
                        '<%= bbc %>/vendor/angular-ui-utils/unique/unique.js',
                        '<%= bbc %>/vendor/angular-ui-utils/validate/validate.js',

                        // baboon.services
                        '<%= bbc %>/lib/services/baboon-core.js',
                        '<%= bbc %>/lib/services/lx-form.js',
                        '<%= bbc %>/lib/services/lx-inline-edit.js',

                        // baboon.directives
                        '<%= bbc %>/lib/directives/lx-file-upload.js',
                        '<%= bbc %>/lib/directives/lx-float.js',
                        '<%= bbc %>/lib/directives/lx-integer.js',
                        '<%= bbc %>/lib/directives/lx-pager.js',
                        '<%= bbc %>/lib/directives/lx-sort.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/app/ui_examples/**/*.js',
                        '!client/app/ui_examples/**/*.spec.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/public/css/ui_app.css': [

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
                src: ['build/dist/public/js/app.js'],
                dest: 'build/tmp/app.js'
            },
            ui: {
                src: ['build/dist/public/js/ui_app.js'],
                dest: 'build/tmp/ui_app.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/public/js/app.min.js': 'build/tmp/app.js',
                    'build/dist/public/js/ui_app.min.js': 'build/tmp/ui_app.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            target: {
                files: {
                    'build/dist/public/css/app.min.css': ['build/dist/public/css/app.css'],
                    'build/dist/public/css/ui_app.min.css': ['build/dist/public/css/ui_app.css']
                }
            }
        },

        bgShell: {
            e2e: {
                cmd: 'node test/fixtures/resetDB.js e2e'
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
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=livereload.port%>/livereload.js?snipver=1"></script>'}
                ]
            }
        },

        karma: {
            unit: {
                configFile: 'config/karma.conf.js',
                browsers: availableBrowser
            },
            ci: {
                configFile: 'config/karma.conf.js',
                browsers: availableBrowser,
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'build/reports/tests/karma.xml',
                    suite: 'karma'
                }
            },
            debug: {
                configFile: 'config/karma.conf.js',
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
    grunt.registerTask('unitClient', [
        'jshint:test',
        'karma:unit'
    ]);
    grunt.registerTask('coverClient', [
        'clean:coverageClient',
        'jshint:test',
        'karma:coverage',
        'open:coverageClient'
    ]);
    grunt.registerTask('unitServer', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node'
    ]);
    grunt.registerTask('coverServer', [
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
        'clean:dist',
        'copy',
        'concat',
        'replace:livereload',
        'livereload-start',
        'express:dev',
        'open:browser',
        'regarde'
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