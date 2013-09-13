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
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint_files_to_test: ['Gruntfile.js', 'lib/**/*.js', 'lib_client/directives/**/*.js',
            'lib_client/services/**/*.js','lib_client/module/**/*.js', 'test/**/*.js'],
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            jasmine: ['build/reports/tests/server', 'build/tmp'],
            karma: ['build/reports/tests/client'],
            lint: ['build/reports/lint'],
            coverageServer: ['build/reports/coverage/server', 'build/tmp'],
            coverageClient: ['build/reports/coverage/client']
        },
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
                    reporterOutput: 'build/reports/lint/jshint.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/lint/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/reports/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test/lib --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/reports/coverage/server --dir build/reports/coverage cobertura'
            }
        },
        open: {
            coverageServer: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/server/'))
            },
            coverageClient: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/client/'))
            }
        },
        karma: {
            unit: {
                configFile: 'test/karma.conf.js'
            },
            ci: {
                configFile: 'test/karma.conf.js',
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'build/reports/tests/client/lib_client.xml',
                    suite: 'lib_client'
                }
            },
            debug: {
                configFile: 'test/karma.conf.js',
                detectBrowsers: {
                    enabled: false
                },
                singleRun: false
            },
            coverage: {
                configFile: 'test/karma.coverage.conf.js'
            },
            cobertura: {
                configFile: 'test/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: 'build/reports/coverage/client'
                }
            }
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test/lib',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: './build/reports/tests/server/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-karma');

    // Register tasks.
    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('debug', ['karma:debug']);
    grunt.registerTask('test', ['clean:jasmine', 'jshint:test', 'jasmine_node', 'karma:unit']);
    grunt.registerTask('test:client', ['jshint:test', 'karma:unit']);
    grunt.registerTask('test:server', ['clean:jasmine', 'jshint:test', 'jasmine_node']);
    grunt.registerTask('cover', ['clean:coverageServer', 'clean:coverageClient', 'jshint:test', 'bgShell:coverage', 'karma:coverage', 'open:coverageClient', 'open:coverageServer']);
    grunt.registerTask('cover:client', ['clean:coverageClient', 'jshint:test', 'karma:coverage', 'open:coverageClient']);
    grunt.registerTask('cover:server', ['clean:coverageServer', 'jshint:test', 'bgShell:coverage', 'open:coverageServer']);
    grunt.registerTask('ci', ['clean', 'jshint:jslint', 'jshint:checkstyle', 'bgShell:coverage', 'bgShell:cobertura', 'jasmine_node', 'karma:unit', 'karma:coverage', 'karma:cobertura']);

    // Default task.
    grunt.registerTask('default', ['test']);
};