'use strict';

module.exports = function (grunt) {
    var path = require('path');

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

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Project configuration.
    grunt.initConfig({

        // Project settings
        yeoman: {
            jshint: {
                files: [
                    'lib/**/*.js',
                    '!lib/client/bower_components/**/*.js',
                    /*'!lib/client/karma.conf.js',
                    '!lib/client/karma.coverage.conf.js',*/
                    'test/**/*.js',
                    'Gruntfile.js'
                ]
            }
        },
        clean: {
            jasmine: ['.reports/test', '.tmp'],
            lint: ['.reports/lint'],
            coverage: ['.reports/coverage', '.tmp'],
            node_modules: ['node_modules'],
            ci: ['.reports', '.tmp'],
            coverage_client: '.reports/coverage/client',
            coverage_lib: '.reports/coverage/lib',
            test: '.reports/test',
            jshint: '.reports/jshint'
        },
        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            test: '<%= yeoman.jshint.files %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: '.reports/lint/jshint.xml'
                },
                files: {
                    src: '<%= yeoman.jshint.files %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '.reports/lint/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= yeoman.jshint.files %>'
                }
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage/lib node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage/lib --dir .reports/coverage/lib cobertura'
            },
            npm: {
                cmd: 'npm install',
                fail: true
            }
        },
        open: {
            coverageClient: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/client/'));
                }
            },
            coverageServer: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/lib/'));
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
                savePath: '.reports/test/lib/',
                useDotNotation: true,
                consolidate: true
            }
        },
        karma: {
            unit: {
                configFile: 'lib/client/karma.conf.js',
                singleRun: true
            },
            coverage: {
                configFile: 'lib/client/karma.coverage.conf.js'
            },
            ci: {
                configFile: 'lib/client/karma.conf.js',
                reporters: ['mocha', 'junit'],
                junitReporter: {
                    outputFile: '.reports/test/client/karma.xml',
                    suite: 'karma'
                }
            },
            cobertura: {
                configFile: 'lib/client/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: '.reports/coverage/client'
                }
            }
        }
    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test:lib', ['clean:test', 'jshint:test', 'jasmine_node']);
    grunt.registerTask('test:client', ['clean:test', 'jshint:test', 'karma:unit']);
    grunt.registerTask('test', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit'
    ]);

    grunt.registerTask('ci', [
        'clean:test',
        'clean:coverage_lib',
        'clean:coverage_client',
        'clean:test',
        'clean:jshint',
        'jshint:jslint',
        'jshint:checkstyle',
        'jasmine_node',
        'bgShell:coverage',
        'bgShell:cobertura',
        'karma:ci',
        'karma:coverage',
        'karma:cobertura'
    ]);

    // coverage client
    grunt.registerTask('cover:client', [
        'clean:coverage_client',
        'karma:coverage',
        'open:coverageClient'
    ]);

    // coverage server
    grunt.registerTask('cover:lib', [
        'clean:coverage_lib',
        'bgShell:coverage',
        'open:coverageServer'
    ]);

    // coverage all
    grunt.registerTask('cover', [
        'cover:client',
        'cover:lib'
    ]);

    grunt.registerTask('update', 'Delete node_modules folder and run npm install', ['clean:node_modules', 'bgShell:npm']);

    // Default task.
    grunt.registerTask('default', ['test']);
};