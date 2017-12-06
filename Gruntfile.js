'use strict';

module.exports = function (grunt) {
    var path = require('path');

    /**
     * Gets the index.html file from the code coverage folder.
     *
     * @param {!string} folder The path to the code coverage folder.
     */
    function getCoverageReport(folder) {
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
        shell: {
            coverage: {
                command: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage node_modules/jasmine/bin/jasmine.js -- JASMINE_CONFIG_PATH=test/jasmine.json',
                options: {
                    async: false
                }
            },
            cobertura: {
                command: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage --dir build/reports/coverage cobertura',
                options: {
                    async: false
                }
            }
        },
        open: {
            coverage: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/'));
                }
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: 'spec.js', // also accepts an array
                reporters: {
                    console: {
                        colors: true,
                        cleanStack: 1,
                        verbosity: 3,
                        listStyle: 'indent',
                        activity: false
                    }
                }
            },
            test: { specs: ['test/**'] },
            ci: {
                specs: ['test/**'],
                options: {
                    reporters: {
                        junit: {
                            report: true,
                            savePath: '.reports/test/',
                            useDotNotation: true,
                            consolidate: true
                        }
                    }
                }
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    preset: 'angular'
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        },
        bump: {
            options: {
                commitFiles: ['.'],
                commitMessage:
                    'chore: release v%VERSION%',
                files:
                    ['package.json'],
                push:
                    false
            }
        }
    });

    grunt.registerTask('git:commitHook', 'Install git commit hook', function () {
        grunt.file.copy('validate-commit-msg.js', '.git/hooks/commit-msg');
        require('fs').chmodSync('.git/hooks/commit-msg', '0755');
        grunt.log.ok('Registered git hook: commit-msg');
    });

    grunt.registerTask('lint', ['jshint:test']);
    grunt.registerTask('test', ['git:commitHook', 'clean:jasmine', 'jshint:test', 'jasmine_nodejs:test']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'shell:coverage', 'open:coverage']);
    grunt.registerTask('ci', ['clean:ci', 'jshint:jslint', 'jshint:checkstyle', 'jasmine_nodejs:ci', 'shell:coverage', 'shell:cobertura']);
    grunt.registerTask('release', 'Bump version, update changelog and tag version', function (version) {
        grunt.task.run([
            'bump:' + (version || 'patch') + ':bump-only',
            'conventionalChangelog:release',
            'bump-commit'
        ]);
    });

// Default task.
    grunt.registerTask('default', ['test']);
}
;
