'use strict';
module.exports = function (grunt) {

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.config.json'),
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
            dist: ['dist'],
            app: ['dist/app','dist/*.*'],
            components: ['dist/components'],
            assets: ['dist/assets']
        },
        // lint files
        jshint: {
            files: ['Gruntfile.js', 'server/**/*.js', 'client/app/**/*.js','test/**/*.js'],
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
                    angular: true
                }
            }
        },
        // copy files
        copy: {
            client: {
                files: [
                    { dest: 'dist/', src : ['*.*'], expand: true, cwd: 'client/' }
                ]
            },
            views: {
                files: [
                    {dest: 'dist/views', src: ['*.html', '**/*.html'], expand: true, cwd:'client/app/'}
                ]
            },
            components: {
                files: [
                    { dest: 'dist/components/', src : '**/*.js', expand: true, cwd: 'client/components/' }
                ]
            },
            assets: {
                files: [
                    { dest: 'dist/assets', src : '**', expand: true, cwd: 'client/assets/' }
                ]
            }
        },
        concat: {
            app: {
                src: [
                    'client/lib/module.prefix',
                    'client/app/**/*.js',
                    '!client/app/**/*.spec.js',
                    'client/lib/module.suffix'
                ],
                dest: 'dist/app.js'
            }
        },
        server: {
            script: 'server.js'
        },
        livereload: {
            port: 35729 // Default livereload listening port.
        },
        // Configuration to be run (and then tested)
        regarde: {
            app: {
                files: ['client/app/**/*.*', 'client/*.*'],
                tasks: ['build:app', 'livereload']
            },
            components: {
                files: ['client/components/**/*.*'],
                tasks: ['build:components', 'livereload']
            },
            assets: {
                files: ['client/assets/**/*.*'],
                tasks: ['build:assets', 'livereload']
            },
            server: {
                files: 'server/**/*.*',
                tasks: ['express-server','livereload']
            }
        },
        open: {
            server: {
                url: '<%= conf.development.baseUrl %>'
            }
        },
        replace: {
            debug: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''}

                ]
            },
            livereload: {
                src: ['build/dist/index.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: '<script src="http://localhost:<%=livereload.port%>/livereload.js?snipver=1"></script>'}
                ]
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            app: {
                files: {
                    'dist/app.js': 'dist/app.js'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
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
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-karma');

    // Tasks
    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'concat',
        'replace:debug'
    ]);
    grunt.registerTask('lint', [
        'clean:reports',
        'jshint:files'
    ]);
    grunt.registerTask('test', [
        'clean:reports',
        'jshint:files',
        'karma'
    ]);
    grunt.registerTask('build:app', [
        'clean:app',
        'copy:client',
        'copy:views',
        'concat',
        'replace:livereload'
    ]);
    grunt.registerTask('build:components', [
        'clean:components',
        'copy:components',
        'replace:livereload'
    ]);
    grunt.registerTask('build:assets', [
        'clean:assets',
        'copy:assets',
        'replace:livereload'
    ]);
    grunt.registerTask('release', [
        'clean:dist',
        'copy',
        'concat',
        'uglify',
        'replace:release'
    ]);
    grunt.registerTask('server', [
        'build',
        'livereload-start',
        'express-server',
        'replace:livereload',
        'open:server',
        'regarde'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};