'use strict';

var path = require('path');
var config_dev = require('./config')().development();

module.exports = function (grunt) {

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
        bowerrc: grunt.file.readJSON('.bowerrc'),
        // Project settings
        yeoman: {
            // configurable paths
            client: 'client',
            assets: 'client/assets',
            server: 'server',
            dist: '.dist',
            jshint: {
                files: [
                    'server/modules/**/*.js',
                    'client/app/**/*.js',
                    'client/common/**/*.js',
                    'test/**/*.js',
                    'config.js',
                    'Gruntfile.js',
                    'server.js',
                    '!client/app/apidoc/parts/docNavigation.js'
                ],
                client_files: [
                    'client/app/**/*.js',
                    'client/common/**/*.js'
                ],
                server_files: [
                    'server/modules/**/*.js',
                    'test/server/**/*.js'
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
            },
            e2e: {
                options: {
                    args: ['--config', 'e2eTest'],
                    script: 'server.js'
                }
            },
            e2e_prod: {
                options: {
                    args: ['--config', 'e2eProductionTest'],
                    script: 'server.js'
                }
            }
        },
        open: {
            server: {
                url: 'http://<%= express.options.host %>:<%= express.options.port %>'
            },
            coverageClient: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/client/'));
                }
            },
            coverageServer: {
                path: function () {
                    return path.join(__dirname, getCoverageReport('.reports/coverage/server/'));
                }
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
                files: ['<%= yeoman.client %>/less/**/*.less', '<%= yeoman.client %>/app/**/*.less', '<%= yeoman.client %>/common/**/*.less'],
                tasks: ['less', 'autoprefixer']
            },
            views: {
                files: ['<%= yeoman.client %>/*.html', '<%= yeoman.client %>/app/**/index.html', '<%= yeoman.client %>/common/**/index.html'],
                tasks: ['newer:copy:views']
            },
            partials: {
                files: ['<%= yeoman.client %>/app/**/*.html', '!<%= yeoman.client %>/*.html', '!<%= yeoman.client %>/app/**/index.html', '<%= yeoman.client %>/common/**/*.html', '!<%= yeoman.client %>/common/**/index.html'],
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
                    'server/**/*.{js,json}',
                    '!server/var/**/*.{js,json}'
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
            test_client: {
                src: '<%= yeoman.jshint.client_files %>'
            },
            test_server: {
                src: '<%= yeoman.jshint.server_files %>'
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
                            '<%= yeoman.dist %>/views/*',
                            '<%= yeoman.dist %>/public/*'
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
                        '<%= yeoman.dist %>/public/scripts/**/*.js',
                        '<%= yeoman.dist %>/public/styles/**/*.css',
                        '<%= yeoman.dist %>/public/assets/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
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
                dest: '<%= yeoman.dist %>/public'
            }
        },

        // Performs rewrites based on rev and the usemin Prepare configuration
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
                        cwd: '<%= yeoman.assets %>/images',
                        src: '**/*.{png,jpg,jpeg,gif}',
                        dest: '<%= yeoman.dist %>/public/assets/images'
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
                        dest: '<%= yeoman.dist %>/public/assets/images'
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
                        dest: '<%= yeoman.dist %>/views'
                    },
                    {
                        expand: true,
                        cwd: '<%= yeoman.client %>',
                        src: ['app/**/*.html', '!app/**/index.html', 'common/**/*.html', '!common/**/index.html'],
                        dest: '<%= yeoman.dist %>/views/partials'
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
                            'assets/bower_components/**/*',
                            'assets/images/**/*.{webp}'

                        ]
                    },
                    {
                        expand: true,
                        cwd: '.tmp/images',
                        dest: '<%= yeoman.dist %>/public/assets/images',
                        src: ['generated/*']
                    },
                    {

                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.client %>/assets',
                        dest: '<%= yeoman.dist %>/public/styles',
                        src: [
                            'fonts/**/*'
                        ]
                    }
                ]
            },
            views: {
                expand: true,
                cwd: '<%= yeoman.client %>',
                dest: '.tmp/views/',
                src: ['*.html', '**/index.html', '!assets/**/*']
            },
            locale_dev: {
                expand: true,
                cwd: './client/app/',
                src: '**//__locale/*.json',
                dest: './.tmp/locale/',
                rename: function(dest, src) {
                    var modulePath = src.substring(0, src.indexOf('/__locale'));
                    return path.resolve(dest, modulePath, path.basename(src));
                }
            },
            locale_pro: {
                expand: true,
                cwd: './client/app/',
                src: '**//__locale//*.json',
                dest: './.dist/public/locale/',
                rename: function(dest, src) {
                    var modulePath = src.substring(0, src.indexOf('/__locale'));
                    return path.resolve(dest, modulePath, path.basename(src));
                }
            }
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
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
            options: {
                specNameMatcher: 'spec', // load only specs containing specNameMatcher
                requirejs: false,
                forceExit: true
            },
            test: ['test/server/'],
            ci: {
                options: {
                    jUnit: {
                        report: true,
                        savePath: './.reports/test/server/',
                        useDotNotation: true,
                        consolidate: true
                    }
                },
                src: ['test/server/']
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir .reports/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test/server --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root .reports/coverage/server --dir .reports/coverage/server cobertura'
            },
            update_webdriver: {
                cmd: 'node node_modules/protractor/bin/webdriver-manager update',
                fail: true
            },
            protractor: {
                cmd: 'node node_modules/protractor/bin/protractor test/e2e.conf.js',
                fail: true
            }
        },
        less: {
            target: {
                options: {
                    paths: ['client/less']
                },
                files: [
                    {
                        expand: true,
                        cwd: 'client/app',
                        src: ['**/*.less'],
                        dest: '.tmp/styles/',
                        ext: '.css'
                    }
                ]
            }
        },
        'merge-locale': {
            dev: {
                common: './client/locale*//*.json',
                src: './.tmp/locale/**//*.json'
            },
            pro: {
                common: './client/locale*//*.json',
                src: './.dist/public/locale/**//*.json'
            }
        },
        'merge-nav': {
            nav: {
                src: './client/app/**//navigation.json',
                dest: './.dist/navigation.js'
            }
        }
    });

    grunt.registerMultiTask('merge-nav', function() {
        var ar = [];
        this.files.forEach(function(file) {
            file.src.forEach(function (src) {
                var nav = grunt.file.readJSON(src);
                ar.push(nav);
            });
        });

        ar.sort(function(a, b) {
            var ao = parseInt(a.order) || 999;
            var bo = parseInt(b.order) || 999;
            return ao > bo;
        });

        var json = [];
        ar.forEach(function(a) {
            json.push(JSON.stringify(a, null, '\t'));
        });

        var content = '\'use strict\';\nmodule.exports = function () {\nreturn [\n';
        content += json.join(',');
        content += '\n];\n};';

        grunt.file.write(this.data.dest, content);
    });

    grunt.registerMultiTask('merge-locale', function () {
        var sourceFiles = grunt.file.expand(this.data.src);
        var commonFiles = grunt.file.expand(this.data.common);

        var sort = function (ar) {
            ar.sort(function (a, b) {
                return path.basename(a) > path.basename(b);
            });
        };

        sort(sourceFiles);
        sort(commonFiles);

        var commonLocale = null;
        // saves the common json
        // because all languages are sorted there is no need to load the same json from file for every same project locale
        var commonLocaleJSON = null;

        for (var i = 0; i < sourceFiles.length; i++) {
            var sourceFile = path.basename(sourceFiles[i]);

            if (commonLocale !== sourceFile) {
                for (var j = 0; j < commonFiles.length; j++) {
                    var commonFile = path.basename(commonFiles[j]);
                    if (commonFile === sourceFile) {
                        commonLocale = commonFile;
                        commonLocaleJSON = grunt.file.readJSON(commonFiles[j]);
                        break;
                    }
                }
            }

            var sourceLocaleJSON = grunt.file.readJSON(sourceFiles[i]);
            // deep copy to keep the common json object
            var commonTemp = grunt.util._.extend({}, commonLocaleJSON);
            var json = grunt.util._.extend(commonTemp, sourceLocaleJSON);
            grunt.file.write(sourceFiles[i], JSON.stringify(json, null, '\t'));
        }
    });

    grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
        this.async();
    });

    grunt.registerTask('setup', function (config) {
        var done = this.async();

        grunt.util.spawn({cmd: 'node', args: ['scripts/setup.js', config || 'production'], opts: {stdio: 'inherit', env: process.env}}, function (error) {
            done(error);
        });
    });

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
        'usemin',
        'copy:locale_pro',
        'merge-locale:pro',
        'merge-nav:nav',
        'setup'
    ]);

    // build development version
    grunt.registerTask('build:dev', [
        'clean:server',
        'concurrent:server',
        'autoprefixer',
        'copy:locale_dev',
        'merge-locale:dev',
        'merge-nav:nav'
    ]);

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'express:prod', 'open:server', 'express-keepalive']);
        }

        return grunt.task.run([
            'build:dev',
            'express:dev',
            'wait',
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
        'clean:test',
        'newer:jshint:test',
        'karma:unit',
        'jasmine_node:test'
    ]);

    // client tests
    grunt.registerTask('test:client', [
        'clean:test',
        'newer:jshint:test_client',
        'karma:unit'
    ]);

    // server tests
    grunt.registerTask('test:server', [
        'clean:test',
        'newer:jshint:test_server',
        'jasmine_node:test'
    ]);

    // coverage all
    grunt.registerTask('cover', [
        'clean:test',
        'clean:coverage_client',
        'clean:coverage_server',
        'karma:coverage',
        'bgShell:coverage',
        'open:coverageClient',
        'open:coverageServer'
    ]);

    // coverage client
    grunt.registerTask('cover:client', [
        'clean:test',
        'clean:coverage_client',
        'karma:coverage',
        'open:coverageClient'
    ]);

    // coverage server
    grunt.registerTask('cover:server', [
        'clean:test',
        'clean:coverage_server',
        'bgShell:coverage',
        'open:coverageServer'
    ]);

    // test and coverage for ci
    grunt.registerTask('ci', [
        'clean:test',
        'clean:coverage_server',
        'clean:coverage_client',
        'clean:jshint',
        'jshint:jslint',
        'jshint:checkstyle',
        'jasmine_node:ci',
        'bgShell:coverage',
        'bgShell:cobertura',
        'karma:ci',
        'karma:coverage',
        'karma:cobertura'
    ]);

    // test scenarios
    grunt.registerTask('e2e', [
        'bgShell:update_webdriver',
        'build:dev',
        'express:e2e',
        'bgShell:protractor'
    ]);

    // test scenarios production mode
    grunt.registerTask('e2e:dist', [
        'bgShell:update_webdriver',
        'build',
        'express:e2e_prod',
        'bgShell:protractor'
    ]);

    // test all and build productive version
    grunt.registerTask('default', [
        'test',
        'build'
    ]);

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
