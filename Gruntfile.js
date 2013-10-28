'use strict';

module.exports = function (grunt) {
    var path = require('path'),
        fs = require('fs'),
        gitHooksScriptFolder = path.join('example', 'scripts', 'git-hooks'),
        gitHooksPath = path.join('.git', 'hooks'),
        gitHooks = ['pre-receive.js', 'update.js', 'post-merge'];

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
    grunt.registerTask('git:registerHooks', 'Install git hooks', function () {
        gitHooks.forEach(function (hook) {
            var src = path.join(gitHooksScriptFolder, hook),
                dest = path.join(gitHooksPath, hook.replace('.js', ''));

            grunt.file.copy(src, dest);
            fs.chmodSync(dest, '0755');

            grunt.log.ok('Registered git hook %s.', dest);
        });
    });

    grunt.registerTask('git:removeHooks', 'Remove git hooks', function () {
        gitHooks.forEach(function (hook) {
            var dest = path.join(gitHooksPath, hook.replace('.js', ''));

            if (grunt.file.exists(dest)) {
                grunt.file.delete(dest);
                grunt.log.ok('Removed git hook %s.', dest);
            } else {
                grunt.log.ok('Git hook %s was already removed.', dest);
            }
        });
    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test', ['git:registerHooks', 'clean:jasmine', 'jshint:test', 'jasmine_node']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'bgShell:coverage', 'open:coverage']);
    grunt.registerTask('ci', ['clean', 'jshint:jslint', 'jshint:checkstyle', 'jasmine_node', 'bgShell:coverage', 'bgShell:cobertura']);

    // Default task.
    grunt.registerTask('default', ['test']);
};