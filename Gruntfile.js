module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        jshint: {
            files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
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
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                indent: 4,
                quotmark: 'single',
                boss: true,
                eqnull: true,
                es5: true,
                loopfunc: true,
                sub: true,
                browser: true,
                jquery: true,
                node: true,
                white: true,
                globals: {
                    exports: true,
                    describe: true,
                    it: true,
                    expect: true,
                    bbConfig: true
                }
            }
        },
        watch: {
            files: '<%= jshint.files %>',
            tasks: ['jshint:files']
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'tests',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: './build/reports/jasmine/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Load tasks.
    //noinspection JSUnresolvedFunction
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //noinspection JSUnresolvedFunction
    grunt.loadNpmTasks('grunt-contrib-watch');
    //noinspection JSUnresolvedFunction
    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task.
    //noinspection JSUnresolvedFunction
    grunt.registerTask('default', ['jshint:files', 'jasmine_node']);
    grunt.registerTask('test', ['jshint:files', 'jasmine_node']);
};