'use strict';

var path = require('path');
var config_dev = require('./config')().development();

module.exports = function (grunt) {

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

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            client: 'client',
            assets: 'client/assets',
            server: 'server',
            jshint: {
                files: [
                    'server/controllers/**/*.js',
                    'server/config/**/*.js',
                    'client/app/**/*.js',
                    'client/common/**/*.js',
                    'client/toplevels/**/*.js',
                    'test/**/*.js',
                    'config.js',
                    'Gruntfile.js',
                    'server.js'
                ]
            }
        },
        express: {
            options: {
                port: config_dev.port,
                host: config_dev.host
            },
            dev: {
                options: {
                    args: ['--config', 'development', '--livereload'],
                    script: 'server.js',
                    debug: true
                }
            },
            prod: {
                options: {
                    script: 'server.js'
                }
            }
        },
        open: {
            server: {
                url: 'http://<%= express.options.host %>:<%= express.options.port %>'
            },
            coverageClient: {
                path: path.join(__dirname, getCoverageReport('.reports/coverage/client/'))
            },
            coverageServer: {
                path: path.join(__dirname, getCoverageReport('.reports/coverage/server/'))
            }
        },
        watch: {
            js: {
                files: ['<%= yeoman.client %>/app/**/*.js', '<%= yeoman.client %>/common/**/*.js'],
                tasks: ['newer:jshint:test'],
                options: {
                    livereload: true
                }
            },
            jsTest: {
                files: ['<%= yeoman.client %>/app/**/*.spec.js', '<%= yeoman.client %>/common/**/*.spec.js'],
                tasks: ['newer:jshint:test']
            },
            styles: {
                files: ['<%= yeoman.client %>/less/**/*.less','<%= yeoman.client %>/app/**/*.less', '<%= yeoman.client %>/common/**/*.less'],
                tasks: ['less', 'autoprefixer']
            },
            views: {
                files: ['<%= yeoman.client %>/*.html', '<%= yeoman.client %>/app/**/index.html', '<%= yeoman.client %>/common/**/index.html'],
                tasks: ['newer:copy:views']
            },
            partials: {
                files: ['<%= yeoman.client %>/app/**/*.html', '!<%= yeoman.client %>/*.html', '!<%= yeoman.client %>/app/**/index.html','<%= yeoman.client %>/common/**/*.html', '!<%= yeoman.client %>/common/**/index.html'],
                tasks: ['newer:copy:partials']
            },
            livereload: {
                files: [
                    '{.tmp,<%= yeoman.client %>}/app/**/*.html',
                    '{.tmp,<%= yeoman.client %>}/common/**/*.html',
                    '.tmp/styles/**/*.css',
                    '<%= yeoman.client %>/app/**/*.js',
                    '<%= yeoman.client %>/common/**/*.js',
                    '<%= yeoman.assets %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ],

                options: {
                    livereload: true
                }
            },
            express: {
                files: [
                    'server.js',
                    'server/**/*.{js,json}'
                ],
                tasks: ['express:dev', 'wait'],
                options: {
                    livereload: true,
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: true,
                reporter: require('jshint-stylish')
            },
            test: {
                src: '<%= yeoman.jshint.files %>'
            },
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

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= yeoman.server %>/views/*',
                            '<%= yeoman.server %>/public/*',
                            '!<%= yeoman.server %>/public/.git*'
                        ]
                    }
                ]
            },
            coverage_client: '.reports/coverage/client',
            coverage_server: '.reports/coverage/server',
            test: '.reports/test',
            jshint: '.reports/jshint',
            server: '.tmp'
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/styles/',
                        src: '**/*.css',
                        dest: '.tmp/styles/'
                    }
                ]
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.server %>/public/scripts/**/*.js',
                        '<%= yeoman.server %>/public/styles/**/*.css',
                        '<%= yeoman.server %>/public/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.server %>/public/styles/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= yeoman.client %>/app/**/index.html', '<%= yeoman.client %>/common/**/index.html'],
            options: {
                dest: '<%= yeoman.server %>/public'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.server %>/views/**/*.html'],
            css: ['<%= yeoman.server %>/public/styles/**/*.css'],
            options: {
                assetsDirs: ['<%= yeoman.server %>/public']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.assets %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.server %>/public/assets/images'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.assets %>/images',
                        src: '**/*.svg',
                        dest: '<%= yeoman.server %>/public/assets/images'
                    }
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    //collapseWhitespace: true,
                    //collapseBooleanAttributes: true,
                    //removeCommentsFromCDATA: true,
                    //removeOptionalTags: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.client %>',
                        src: ['*.html', 'app/**/index.html', 'common/**/index.html'],
                        dest: '<%= yeoman.server %>/views'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.client %>',
                        src: ['app/**/*.html', '!app/**/index.html', 'common/**/*.html', '!common/**/index.html'],
                        dest: '<%= yeoman.server %>/views/partials'
                    }
                ]
            }
        },

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp/concat/scripts',
                        src: '**/*.js',
                        dest: '.tmp/concat/scripts'
                    }
                ]
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [
                    {

                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.client %>',
                        dest: '<%= yeoman.server %>/public',
                        src: [
                            '**/*.{ico,png,txt}',
                            'assets/bower_components/**/*',
                            'assets/images/**/*.{webp}',
                            'assets/fonts/**/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= yeoman.server %>/public/assets/images',
                        src: ['generated/*']
                    }
                ]
            },
            views: {
                expand: true,
                cwd: '<%= yeoman.client %>',
                dest: '.tmp/views/',
                src: ['*.html', '**/index.html', '!assets/**/*']
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'less',
                'copy:views'
            ],
            test: [
                'less',
                'copy:views'
            ],
            dist: [
                'less',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        shell: {
            protractor: {
                options: {
                    stdout: true
                },
                command: 'protractor test/e2e.conf.js'
            }
        },
        // Test settings
        karma: {
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            },
            coverage: {
                configFile: 'test/karma.coverage.conf.js'
            },
            ci: {
                configFile: 'test/karma.conf.js',
                reporters: ['mocha', 'junit'],
                junitReporter: {
                    outputFile: '.reports/test/client/karma.xml',
                    suite: 'karma'
                }
            },
            cobertura: {
                configFile: 'test/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: '.reports/coverage/client'
                }
            }
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test/server',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: './.reports/test/server/',
                useDotNotation: true,
                consolidate: true
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test/server --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage/server --dir .reports/coverage/server cobertura'
            }
        },
        less: {
            target: {
                options: {
                    paths: ['client/less']
                },
                files: [{
                    expand: true,
                    cwd: 'client/app',
                    src: ['**/*.less'],
                    dest: '.tmp/styles/',
                    ext: '.css'
                }]
            }
        }
    });

    grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
        this.async();
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'express:prod', 'open:server', 'express-keepalive']);
        }

        return grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'express:dev',
            'open:server',
            'watch'
        ]);
    });

    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    // all tests
    grunt.registerTask('test', [
        'clean:server',
        'clean:test',
        'concurrent:test',
        'autoprefixer',
        'jshint:test',
        'karma:unit',
        'jasmine_node'
    ]);

    // client tests
    grunt.registerTask('test:client', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'karma:unit'
    ]);

    // server tests
    grunt.registerTask('test:server', [
        'clean:test',
        'jasmine_node'
    ]);

    // test scenarios
    grunt.registerTask('e2e', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'express:dev',
        'shell:protractor'
    ]);

    // coverage client
    grunt.registerTask('cover:client', [
        'clean:coverage_client',
        'karma:coverage',
        'open:coverageClient'
    ]);

    // coverage server
    grunt.registerTask('cover:server', [
        'clean:coverage_server',
        'bgShell:coverage',
        'open:coverageServer'
    ]);

    // coverage all
    grunt.registerTask('cover', [
        'cover:client',
        'cover:server'
    ]);

    grunt.registerTask('ci', [
        'clean:coverage_server',
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

    // build productive version
    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'ngmin',
        'copy:dist',
        'cssmin',
        'uglify',
        'rev',
        'usemin'
    ]);

    // build development version
    grunt.registerTask('build:dev', [
        'clean:server',
        'concurrent:server',
        'autoprefixer'
    ]);

    // test all and build productive version
    grunt.registerTask('default', [
        'test',
        'build'
    ]);

    grunt.registerTask('lint', ['jshint:test']);

    // task that simply waits for 1 second, usefull for livereload
    grunt.registerTask('wait', function () {
        grunt.log.ok('Waiting...');

        var done = this.async();

        setTimeout(function () {
            grunt.log.writeln('Done waiting!');
            done();
        }, 1000);
    });
};
