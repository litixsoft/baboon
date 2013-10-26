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

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint_files_to_test: ['Gruntfile.js', 'lib/**/*.js', 'lib_client/directives/**/*.js',
            'lib_client/services/**/*.js', 'lib_client/module/**/*.js', 'test/**/*.js'],
        clean: {
            jasmine: ['build/reports/tests', 'build/tmp'],
            lint: ['build/reports/lint'],
            coverage: ['build/reports/coverage', 'build/tmp']
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
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/reports/coverage node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test/lib --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/reports/coverage --dir build/reports/coverage cobertura'
            }
        },
        open: {
            coverage: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/'))
            }
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test/lib',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: './build/reports/tests/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Register tasks.
//    grunt.registerTask('git:hooks', 'Install pre-push script if it doesn\'t exist', function () {
//        if (!grunt.file.exists('.git/hooks/pre-push')) {
//            grunt.file.copy('example/scripts/pre-push.js', '.git/hooks/pre-push');
//            require('fs').chmodSync('.git/hooks/pre-push', '0755');
//        }
//    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test', ['clean:jasmine', 'jshint:test', 'jasmine_node']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'bgShell:coverage', 'open:coverage']);
    grunt.registerTask('ci', ['clean', 'jshint:jslint', 'jshint:checkstyle', 'jasmine_node', 'bgShell:coverage', 'bgShell:cobertura']);

    // Default task.
    grunt.registerTask('default', ['test']);
};