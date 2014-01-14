// Generated on 2014-01-11 using generator-angular-fullstack 1.1.1
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

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            client: 'src/client',
            dist: 'dist',
            server: 'src/server'
        },
        express: {
            options: {
                port: process.env.PORT || 9000
            },
            dev: {
                options: {
                    script: 'server.js',
                    debug: true
                }
            },
            prod: {
                options: {
                    script: 'server.js',
                    node_env: 'production'
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>'
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
                files: ['<%= yeoman.client %>/scripts/**/*.js'],
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
            jsTest: {
                files: ['test/spec/**/*.js'],
                tasks: ['newer:jshint:test', 'karma']
            },
            styles: {
                files: ['<%= yeoman.client %>/styles/**/*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                files: [
                    '<%= yeoman.client %>/views/**/*.html',
                    '{.tmp,<%= yeoman.client %>}/styles/**/*.css',
                    '{.tmp,<%= yeoman.client %>}/scripts/**/*.js',
                    '<%= yeoman.client %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
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
                tasks: ['express:dev'],
                options: {
                    livereload: true,
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            client: [
                '<%= yeoman.client %>/scripts/**/*.js'
            ],
            server: [
                '<%= yeoman.server %>/controllers/**/*.js'
            ],
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
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
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
            reports_cover_client: '.reports/coverage/client',
            reports_cover_server: '.reports/coverage/server',
            reports_test_server:  '.reports/test/server',
            reports_test_client:  '.reports/test/client',
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
                        '<%= yeoman.dist %>/public/scripts/**/*.js',
                        '<%= yeoman.dist %>/public/styles/**/*.css',
                        '<%= yeoman.dist %>/public/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/public/styles/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= yeoman.client %>/views/index.html'],
            options: {
                dest: '<%= yeoman.dist %>/public'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/views/**/*.html'],
            css: ['<%= yeoman.dist %>/public/styles/**/*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>/public']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.client %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist %>/public/images'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.client %>/images',
                        src: '**/*.svg',
                        dest: '<%= yeoman.dist %>/public/images'
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
                        cwd: '<%= yeoman.client %>/views',
                        src: ['*.html', 'partials/**/*.html'],
                        dest: '<%= yeoman.dist %>/views'
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
                        dest: '<%= yeoman.dist %>/public',
                        src: [
                            '**/*.{ico,png,txt}',
                            '.htaccess',
                            'bower_components/**/*',
                            'images/**/*.{webp}',
                            'fonts/**/*'
                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= yeoman.dist %>/public/images',
                        src: ['generated/*']
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.client %>/styles',
                dest: '.tmp/styles/',
                src: '**/*.css'
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'copy:styles'
            ],
            test: [
                'copy:styles'
            ],
            dist: [
                'copy:styles',
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
                command: 'protractor e2e.conf.js'
            }
        },
        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            },
            coverage: {
                configFile: 'karma.coverage.conf.js'
            },
            ci: {
                configFile: 'karma.conf.js',
                reporters: ['mocha', 'junit'],
                junitReporter: {
                    outputFile: '.reports/test/client/karma.xml',
                    suite: 'karma'
                }
            },
            cobertura: {
                configFile: 'karma.coverage.conf.js',
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
        'clean:reports_test_server',
        'concurrent:test',
        'autoprefixer',
        'newer:jshint',
        'karma:unit',
        'jasmine_node'
    ]);

    // client tests
    grunt.registerTask('test:client', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'newer:jshint:client',
        'karma:unit'
    ]);

    // server tests
    grunt.registerTask('test:server', [
        'newer:jshint:server',
        'clean:reports_test_server',
        'jasmine_node'
    ]);

    // test scenarios
    grunt.registerTask('test:e2e', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'express:dev',
        'shell:protractor'
    ]);

    // all tests
    grunt.registerTask('test:all', [
        'test',
        'test:e2e'
    ]);

    // coverage server and client
    grunt.registerTask('cover', [
        'clean:reports_cover_client',
        'clean:reports_cover_server',
        'karma:coverage',
        'bgShell:coverage',
        'open:coverageClient',
        'open:coverageServer'
    ]);

    // coverage client
    grunt.registerTask('cover:client', [
        'clean:reports_cover_client',
        'karma:coverage',
        'open:coverageClient'
    ]);

    // coverage server
    grunt.registerTask('cover:server', [
        'clean:reports_cover_server',
        'bgShell:coverage',
        'open:coverageServer'
    ]);

    grunt.registerTask('ci', [
        'clean:reports_test_server',
        'clean:reports_cover_server',
        'clean:reports_test_client',
        'clean:reports_cover_client',
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

    // test all and build productive version
    grunt.registerTask('default', [
        'test',
        'build'
    ]);
};
