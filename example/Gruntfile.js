// Generated on 2014-01-11 using generator-angular-fullstack 1.1.1
'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'public',
            views: 'views'
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
            }
        },
        watch: {
            js: {
                files: ['<%= yeoman.app %>/scripts/**/*.js'],
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
                files: ['<%= yeoman.app %>/styles/**/*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/<%= yeoman.views %>/**/*.html',
                    '{.tmp,<%= yeoman.app %>}/styles/**/*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/**/*.js',
                    '<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
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
                '<%= yeoman.app %>/scripts/**/*.js'
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
                            '<%= yeoman.views %>/*',
                            '<%= yeoman.dist %>/*',
                            '!<%= yeoman.dist %>/.git*'
                        ]
                    }
                ]
            },
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
                        '<%= yeoman.dist %>/scripts/**/*.js',
                        '<%= yeoman.dist %>/styles/**/*.css',
                        '<%= yeoman.dist %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: ['<%= yeoman.app %>/<%= yeoman.views %>/index.html'],
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },

        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.views %>/**/*.html'],
            css: ['<%= yeoman.dist %>/styles/**/*.css'],
            options: {
                assetsDirs: ['<%= yeoman.dist %>']
            }
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            }
        },
        svgmin: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '**/*.svg',
                        dest: '<%= yeoman.dist %>/images'
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
                        cwd: '<%= yeoman.app %>/<%= yeoman.views %>',
                        src: ['*.html', 'partials/**/*.html'],
                        dest: '<%= yeoman.views %>'
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
                        cwd: '<%= yeoman.app %>',
                        dest: '<%= yeoman.dist %>',
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
                        dest: '<%= yeoman.dist %>/images',
                        src: ['generated/*']
                    }
                ]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
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
            }
        }
    });

    grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
        this.async();
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'express:prod', 'open', 'express-keepalive']);
        }

        return grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'express:dev',
            'open',
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
        'concurrent:test',
        'autoprefixer',
        'newer:jshint',
        'karma',
        'express:dev',
        'shell:protractor'
    ]);

    // all client tests
    grunt.registerTask('test:client', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'newer:jshint:client',
        'karma'
    ]);

    // all server tests
    grunt.registerTask('test:server', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'karma'
    ]);

    // test only scenarios
    grunt.registerTask('test:e2e', [
        'clean:server',
        'concurrent:test',
        'autoprefixer',
        'express:dev',
        'shell:protractor'
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
