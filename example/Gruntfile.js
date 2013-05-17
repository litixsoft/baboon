'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
        libincludes: grunt.file.readJSON('config/lib.conf.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            reports: ['build/reports'],
            dist: ['build/dist', 'build/tmp']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js'],
            junit: 'build/reports/jshint.xml',
            checkstyle: 'build/reports/jshint_checkstyle.xml',
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
                es5: true,
                loopfunc: true,
                browser: true,
                node: true,
                globals: {
                }
            }
        },

        /**
         * `grunt copy` just copies files from client or vendor to dist.
         */
        copy: {
            client: {
                // all client public files that need to be copy.
                files: [
                    {dest: 'build/dist/', src: ['**'], expand: true, cwd: 'client/public/'}
                ]
            },
            vendor: {
                // all vendor files that need to be copy.
                files: [
                    // images from bootstrap
                    {dest: 'build/dist/img/', src: ['**'], expand: true, cwd: 'vendor/bootstrap/img/'}
                ]
            }
        },

        /**
         * html2js for common templates
         */

        html2js: {


            app: {
                options: {
                    // custom options, see below
                    base: 'client/app'
                },
                src: ['client/app/**/*.html'],
                dest: 'build/dist/js/app.tpl.js'
            },
            ui: {
                options: {
                    // custom options, see below
                    base: 'client/app/ui_examples'
                },
                src: ['client/app/ui_examples/**/*.html'],
                dest: 'build/dist/js/ui_app.tpl.js'
            },
            common: {
                options: {
                    // custom options, see below
                    base: 'client/common'
                },
                src: ['client/common/**/*.html'],
                dest: 'build/dist/js/common.tpl.js'
            }
        },

        /**
         * concat files
         */

        concat: {
            /**
             * The `lib` target is for all third-party js libraries we need to include
             * in the final distribution.
             */
            lib: {
                files: {
                    // lib debug
                    'build/dist/js/lib.js': [
                        'vendor/angular/angular.js',
                        'vendor/angular-ui-utils/utils.js',
                        '<%= libincludes.base.js %>'
                    ],
                    // lib release
                    'build/dist/js/lib.min.js': [
                        'vendor/angular/angular.min.js',
                        'vendor/angular-ui-bootstrap/ui-bootstrap-tpls-0.3.0.min.js'
                        /*angular-ui-utils sind noch nicht als minimierte verfügbar*/
                    ],
                    // libs debug
                    'build/dist/css/lib.css': [
                        'vendor/bootstrap/css/bootstrap.css',
                        'vendor/bootstrap/css/bootstrap-responsive.css',
                        'vendor/litixsoft/default.css'
                    ],
                    // libs release
                    'build/dist/css/lib.min.css': [
                        'vendor/bootstrap/css/bootstrap.min.css',
                        'vendor/bootstrap/css/bootstrap-responsive.min.css',
                        'vendor/litixsoft/default.css'
                    ]
                }
            },
            /**
             * The `app` target is for application js libraries.
             */
            app: {
                files: {
                    'build/dist/js/app.js': [
                        'client/app/module.prefix',
                        'client/app/**/*.js',
                        '!client/app/**/*.spec.js',
                        'client/app/module.suffix'
                    ],
                    'build/dist/css/app.css': [
                        'client/app/**/*.css'
                    ]
                }
            },
            ui: {
                files: {
                    'build/dist/js/ui_app.js': [
                        'client/app/module.prefix',
                        'client/app/ui_examples/**/*.js',
                        '!client/app/ui_examples/**/*.spec.js',
                        'client/app/module.suffix'
                    ],
                    'build/dist/css/ui_app.css': [
                        'client/app/ui_examples/**/*.css'
                    ]
                }
            },
            common: {
                files: {
                    'build/dist/js/common.js': [
                        'client/common/common.prefix',
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',
                        'client/common/common.suffix'
                    ]
                }
            }
        },

        /**
         * prepare uglify with ngmin only for angular stuff
         */

        ngmin: {
            app: {
                src: ['build/dist/js/app.js'],
                dest: 'build/tmp/app.js'
            },
            app_tpl: {
                src: ['build/dist/js/app.tpl.js'],
                dest: 'build/tmp/app.tpl.js'
            },
            ui: {
                src: ['build/dist/js/ui_app.js'],
                dest: 'build/tmp/ui_app.js'
            },
            ui_tpl: {
                src: ['build/dist/js/ui_app.tpl.js'],
                dest: 'build/tmp/ui_app.tpl.js'
            },
            common: {
                src: ['build/dist/js/common.js'],
                dest: 'build/tmp/common.js'
            },
            common_tpl: {
                src: ['build/dist/js/common.tpl.js'],
                dest: 'build/tmp/common.tpl.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/js/app.min.js': 'build/tmp/app.js',
                    'build/dist/js/app.tpl.min.js': 'build/tmp/app.tpl.js',
                    'build/dist/js/ui_app.min.js': 'build/tmp/ui_app.js',
                    'build/dist/js/ui_app.tpl.min.js': 'build/tmp/ui_app.tpl.js',
                    'build/dist/js/common.min.js': 'build/tmp/common.js',
                    'build/dist/js/common.tpl.min.js': 'build/tmp/common.tpl.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            target: {
                files: {
                    'build/dist/css/app.min.css': ['build/dist/css/app.css'],
                    'build/dist/css/ui_app.min.css': ['build/dist/css/ui_app.css']
                }
            }
        },

        nodejs: {
            e2e: {
                script: 'test/fixtures/resetDB.js',
                args: ['e2e']
            }
        },

        express: {
            dev: {
                options: {
                    port: 3000,
                    script: 'app.js'
                }
            },
            e2e: {
                options: {
                    args: ['e2e'],
                    script: 'app.js'
                }
            }
        },
        livereload: {
            port: 35729 // Default livereload listening port.
        },
        // Configuration to be run (and then tested)
        regarde: {
            client: {
                files: ['client/**/*.*', 'client/*.*', '!client/**/*.spec.js'],
                tasks: ['build:regarde', 'livereload']
            },
            server: {
                files: ['server/api/**/*.*', 'server/controllers/**/*.*', 'server/repositories/**/*.*'],
                tasks: ['express:dev', 'livereload']
            }
        },
        open: {
            browser: {
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            }
        },
        replace: {
            debug: {
                src: ['build/dist/*.html', 'build/dist/js/lib.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''},
                    {
                        from: '<!--@@baseInjects-->',
                        to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                            '"<%= libincludes.base.injects[i] %>",' + '\n' +
                            '<% } %>'
                    },
                    {
                        from: '<!--@@jqueryIncludes-->',
                        to: '<% for(var i=0;i<libincludes.jQueryNeeded.length;i++){ %>' +
                            '<script src="<%= libincludes.jQueryNeeded[i] %>"></script>' + '\n' +
                            '<% } %>'
                    },
                    {from: '<!--@@extendCSSincludes-->', to: '<% for(var i=0;i<libincludes.extend.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.extend.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@extendJSincludes-->', to: '<% for(var i=0;i<libincludes.extend.js.length;i++){ %>' +
                        '<script src="<%= libincludes.extend.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@extendInjects-->', to: '<% for(var i=0;i<libincludes.extend.injects.length;i++){ %>' +
                        '"<%= libincludes.extend.injects[i] %>",' +
                        '<% } %>'},
                    {from: '<!--@@vendorCSSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.vendor.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@vendorJSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.js.length;i++){ %>' +
                        '<script src="<%= libincludes.vendor.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@vendorInjects-->', to: '<% for(var i=0;i<libincludes.vendor.injects.length;i++){ %>' +
                        '"<%= libincludes.vendor.injects[i] %>",' +
                        '<% } %>'}

                ]
            },
            release: {
                src: ['build/dist/*.html', 'build/dist/js/lib.min.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: ''},
                    {from: '<!--@@baseInjects-->', to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                        '"<%= libincludes.base.injects[i] %>",' +
                        '<% } %>'},
                    {from: '<!--@@jqueryIncludes-->', to: '<% for(var i=0;i<libincludes.jQueryNeeded.length;i++){ %>' +
                        '<script src="<%= libincludes.jQueryNeeded[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@extendCSSincludes-->', to: '<% for(var i=0;i<libincludes.extend.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.extend.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@extendJSincludes-->', to: '<% for(var i=0;i<libincludes.extend.js.length;i++){ %>' +
                        '<script src="<%= libincludes.extend.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@extendInjects-->', to: '<% for(var i=0;i<libincludes.extend.injects.length;i++){ %>' +
                        '"<%= libincludes.extend.injects[i] %>",' +
                        '<% } %>'},
                    {from: '<!--@@vendorCSSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.vendor.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@vendorJSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.js.length;i++){ %>' +
                        '<script src="<%= libincludes.vendor.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@vendorInjects-->', to: '<% for(var i=0;i<libincludes.vendor.injects.length;i++){ %>' +
                        '"<%= libincludes.vendor.injects[i] %>",' +
                        '<% } %>'}
                ]
            },
            livereload: {
                src: ['build/dist/*.html', 'build/dist/js/lib.js'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@title-->', to: '<%= conf.appName %>'},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=livereload.port%>/livereload.js?snipver=1"></script>'},
                    {from: '<!--@@baseInjects-->', to: '<% for(var i=0;i<libincludes.base.injects.length;i++){ %>' +
                        '"<%= libincludes.base.injects[i] %>",' +
                        '<% } %>'},
                    {from: '<!--@@jqueryIncludes-->', to: '<% for(var i=0;i<libincludes.jQueryNeeded.length;i++){ %>' +
                        '<script src="<%= libincludes.jQueryNeeded[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@extendCSSincludes-->', to: '<% for(var i=0;i<libincludes.extend.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.extend.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@extendJSincludes-->', to: '<% for(var i=0;i<libincludes.extend.js.length;i++){ %>' +
                        '<script src="<%= libincludes.extend.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@extendInjects-->', to: '<% for(var i=0;i<libincludes.extend.injects.length;i++){ %>' +
                        '"<%= libincludes.extend.injects[i] %>",' +
                        '<% } %>'},
                    {from: '<!--@@vendorCSSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.css.length;i++){ %>' +
                        '<link rel="stylesheet" href="<%= libincludes.vendor.css[i] %>"/>' +
                        '<% } %>'},
                    {from: '<!--@@vendorJSincludes-->', to: '<% for(var i=0;i<libincludes.vendor.js.length;i++){ %>' +
                        '<script src="<%= libincludes.vendor.js[i] %>"></script>' +
                        '<% } %>'},
                    {from: '<!--@@vendorInjects-->', to: '<% for(var i=0;i<libincludes.vendor.injects.length;i++){ %>' +
                        '"<%= libincludes.vendor.injects[i] %>",' +
                        '<% } %>'}

                ]
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
            },
            e2e: {
                configFile: 'config/karma-e2e.conf.js'
            }
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: 'build/reports/jasmine/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-livereload');
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerMultiTask('nodejs', 'Run node script.', function () {
        var path = require('path');
        var done = this.async();

        if (!this.data.script) {
            grunt.fail.warn('Undefined script parameter');
            done();
        }

        var script = path.resolve(this.data.script);
        var args = this.data.args || [];

        if (!grunt.file.exists(script)) {
            grunt.fail.warn('File does not exist ' + script);
            done();
        }

        args.unshift(script);

        grunt.log.writeln('run '.white + args.join(' ').cyan);

        grunt.util.spawn({
            cmd: 'node',
            args: args
        }, function (error, result, code) {
            grunt.log.writeln(result);

            if (error) {
                grunt.fail.warn('Error: '.red + ' ' + ('' + code).red);
            } else {
                grunt.log.writeln('Node script run successfully '.white + (code !== 0 ? ('' + code).cyan : ''));
            }

            done();
        });
    });

    // Tasks
    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:debug'
    ]);
    grunt.registerTask('build:regarde', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:livereload'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'ngmin',
        'uglify',
        'cssmin',
        'replace:release'
    ]);
    grunt.registerTask('lint', [
        'clean:reports',
        'jshint:files'
    ]);
    grunt.registerTask('unit', [
        'clean:reports',
        'jasmine_node',
        'karma:unit'
    ]);
    grunt.registerTask('e2e', [
        'nodejs:e2e',
        'clean:reports',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('e2e:release', [
        'nodejs:e2e',
        'clean:reports',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test', [
        'nodejs:e2e',
        'clean:reports',
        'jshint:files',
        'jasmine_node',
        'karma:unit',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test:release', [
        'clean:reports',
        'jshint:files',
        'karma:unit',
        'release',
        'express:dev',
        'karma:e2e'
    ]);
    grunt.registerTask('server', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:livereload',
        'livereload-start',
        'express:dev',
        'open',
        'regarde'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};