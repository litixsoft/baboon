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
                    'test/**/*.js',
                    'Gruntfile.js'
                ]
            }
        },
        clean: {
            jasmine: ['.reports/test', '.tmp'],
            lint: ['.reports/lint'],
            coverage: ['.reports/coverage', '.tmp'],
            ci: ['.reports', '.tmp']
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
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage --dir .reports/coverage cobertura'
            }
        },
        open: {
            coverage: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/'));
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
                savePath: '.reports/test/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test', ['clean:jasmine', 'jshint:test', 'jasmine_node']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'bgShell:coverage', 'open:coverage']);
    grunt.registerTask('ci', ['clean:ci', 'jshint:jslint', 'jshint:checkstyle', 'jasmine_node', 'bgShell:coverage', 'bgShell:cobertura']);

    // Default task.
    grunt.registerTask('default', ['test']);
};