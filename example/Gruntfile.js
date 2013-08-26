'use strict';

module.exports = function (grunt) {

    var path = require('path');

    function getCoverageReport (folder) {
        var reports = grunt.file.expand(folder + '*/index.html');

        if (reports && reports.length > 0) {
            return reports[0];
        }

        return '';
    }

    // Project configuration.
    //noinspection JSUnresolvedFunction,JSUnresolvedVariable
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        conf: grunt.file.readJSON('config/app.conf.json').base,
        bbc: 'node_modules/baboon-client',
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            jshint: ['build/reports/jshint'],
            dist: ['build/dist', 'build/tmp'],
            jasmine: ['build/reports/jasmine'],
            coverageServer: ['build/reports/coverage/server'],
            coverageClient: ['build/reports/coverage/client']
        },
        // lint files
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
            test: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js'],
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: 'build/reports/jshint/jshint.xml'
                },
                files: {
                    src: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                        '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js']
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/jshint/jshint_checkstyle.xml'
                },
                files: {
                    src: ['Gruntfile.js', 'app.js', 'server/**/*.js', 'client/app/**/*.js', 'client/common/**/*.js',
                        '!client/common/angular-*/*.*', 'test/**/*.js', '!test/lib/**/*.js']
                }
            }
        },

        /**
         * `grunt copy` just copies files from client or vendor to dist.
         */
        copy: {
            client: {
                files: [
                    // all public files that need to be copy.
                    {dest: 'build/dist/public', src: ['**', '!*.html'], expand: true, cwd: 'client/public/'},
                    // all toplevel app html files
                    {dest: 'build/dist/views', src: ['*.html'], expand: true, cwd: 'client/public/'},
                    // all common html files
                    {dest: 'build/dist/views', src: ['**/*.html'], expand: true, cwd: 'client/common/'},
                    // all html views that need to be copy.
                    {dest: 'build/dist/views/', src: ['**/*.html'], expand: true, cwd: 'client/app/'},
                    // all vendor files that need to be copy.
                    {dest: 'build/dist/public/img/', src: ['**'], expand: true, cwd: '<%= bbc %>/vendor/bootstrap/img/'}
                ]
            }
        },

        html2js: {
            dist: {
                options: {
                    module: null, // no bundle module for all the html2js templates
                    base: '<%= bbc %>/vendor/angular-ui-bootstrap/'
                },
                files: [
                    {
                        expand: true,
                        src: ['<%= bbc %>/vendor/angular-ui-bootstrap/template/**/*.html'],
                        ext: '.html.js'
//                    dest: 'templates/**/*.html.js'
                    }
                ]
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
                    'build/dist/public/js/lib.js': [
                        //'<%= bbc %>/vendor/jquery/jquery-1.10.2.js',
                        //'<%= bbc %>/vendor/jquery/jquery-2.0.3.js',
                        '<%= bbc %>/vendor/showdown/src/showdown.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/github.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/prettify.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/table.js',
                        //'<%= bbc %>/vendor/showdown/src/extensions/twitter.js',
                        //'<%= bbc %>/vendor/underscore/underscore-1.5.1.js',
                        '<%= bbc %>/vendor/angular/angular.js'
                    ],
                    // lib release
                    'build/dist/public/js/lib.min.js': [
                        //'<%= bbc %>/vendor/jquery/jquery-1.10.2.min.js',
                        //'<%= bbc %>/vendor/jquery/jquery-2.0.3.min.js',
                        '<%= bbc %>/vendor/showdown/compressed/showdown.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/github.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/prettify.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/table.js',
                        //'<%= bbc %>/vendor/showdown/compressed/extensions/twitter.js',
                        //'<%= bbc %>/vendor/underscore/underscore-1.5.1.min.js',
                        '<%= bbc %>/vendor/angular/angular.min.js'
                    ],
                    // libs debug
                    'build/dist/public/css/lib.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.css',
                        '<%= bbc %>/lib/css/default.css'
                    ],
                    // libs release
                    'build/dist/public/css/lib.min.css': [
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap.min.css',
                        '<%= bbc %>/vendor/bootstrap/css/bootstrap-responsive.min.css',
                        '<%= bbc %>/lib/css/default.min.css'
                    ]
                }
            },
            /**
             * The `app` target is for application js and css libraries.
             */
            app: {
                files: {
                    'build/dist/public/js/app.js': [

                        // prefix
                        'client/module.prefix',

                        // ui-bootstrap

                        /* required */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/transition/transition.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/position/position.js',

                        /* optional */

                        /* accordion */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/accordion/accordion.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion-group.html.js',

                        /* alert */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/alert/alert.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/alert/alert.html.js',

                        /* buttons */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/buttons/buttons.js',

                        /* carousel */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/carousel/carousel.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/carousel.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/slide.html.js',

                        /* collapse */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/collapse/collapse.js',

                        /* datepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/datepicker/datepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/datepicker/datepicker.html.js',

                        /* dialog */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dialog/dialog.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/dialog/message.html.js',

                        /* dropdownToggle */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dropdownToggle/dropdownToggle.js',

                        /* modal */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/modal/modal.js',

                        /* pagination */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/pagination/pagination.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pager.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pagination.html.js',

                        /* popover */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/popover/popover.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/popover/popover.html.js',

                        /* progressbar */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/progressbar/progressbar.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/bar.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/progress.html.js',

                        /* rating */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/rating/rating.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/rating/rating.html.js',

                        /* tabs */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tabs/tabs.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tab.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tabset.html.js',

                        /* timepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/timepicker/timepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/timepicker/timepicker.html.js',

                        /* tooltip */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tooltip/tooltip.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-html-unsafe-popup.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-popup.html.js',

                        /* typeahead */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/typeahead/typeahead.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-match.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-popup.html.js',

                        // ui-utils

                        '<%= bbc %>/vendor/angular-ui-utils/event/event.js',
                        '<%= bbc %>/vendor/angular-ui-utils/format/format.js',
                        '<%= bbc %>/vendor/angular-ui-utils/highlight/highlight.js',
                        '<%= bbc %>/vendor/angular-ui-utils/if/if.js',
                        '<%= bbc %>/vendor/angular-ui-utils/indeterminate/indeterminate.js',
                        '<%= bbc %>/vendor/angular-ui-utils/inflector/inflector.js',
                        '<%= bbc %>/vendor/angular-ui-utils/jq/jq.js',
                        '<%= bbc %>/vendor/angular-ui-utils/keypress/keypress.js',
                        '<%= bbc %>/vendor/angular-ui-utils/mask/mask.js',
                        '<%= bbc %>/vendor/angular-ui-utils/reset/reset.js',
                        '<%= bbc %>/vendor/angular-ui-utils/route/route.js',
                        '<%= bbc %>/vendor/angular-ui-utils/scrollfix/scrollfix.js',
                        '<%= bbc %>/vendor/angular-ui-utils/showhide/showhide.js',
                        '<%= bbc %>/vendor/angular-ui-utils/unique/unique.js',
                        '<%= bbc %>/vendor/angular-ui-utils/validate/validate.js',

                        // baboon.services
                        '<%= bbc %>/lib/services/baboon-core.js',
                        '<%= bbc %>/lib/services/lx-form.js',
                        '<%= bbc %>/lib/services/lx-inline-edit.js',

                        // baboon.directives
                        '<%= bbc %>/lib/directives/lx-file-upload.js',
                        '<%= bbc %>/lib/directives/lx-float.js',
                        '<%= bbc %>/lib/directives/lx-integer.js',
                        '<%= bbc %>/lib/directives/lx-pager.js',
                        '<%= bbc %>/lib/directives/lx-sort.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // app
                        'client/app/**/*.js',
                        '!client/app/**/*.spec.js',

                        // ! toplevel apps
                        '!client/app/ui_examples/**/*.js',
                        '!client/app/admin/**/*.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/public/css/app.css': [

                        // app css files
                        'client/app/**/*.css',

                        // ! toplevel css
                        '!client/app/ui_examples/**/*.css',
                        '!client/app/admin/**/*.css'
                    ]
                }
            },

            /**
             * The `ui` target is for toplevel application js and css libraries.
             */
            ui: {
                files: {
                    'build/dist/public/js/ui_app.js': [

                        // prefix
                        'client/module.prefix',

                        // ui-bootstrap

                        /* required */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/transition/transition.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/position/position.js',

                        /* optional */

                        /* accordion */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/accordion/accordion.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion-group.html.js',

                        /* alert */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/alert/alert.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/alert/alert.html.js',

                        /* buttons */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/buttons/buttons.js',

                        /* carousel */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/carousel/carousel.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/carousel.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/slide.html.js',

                        /* collapse */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/collapse/collapse.js',

                        /* datepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/datepicker/datepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/datepicker/datepicker.html.js',

                        /* dialog */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dialog/dialog.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/dialog/message.html.js',

                        /* dropdownToggle */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dropdownToggle/dropdownToggle.js',

                        /* modal */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/modal/modal.js',

                        /* pagination */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/pagination/pagination.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pager.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pagination.html.js',

                        /* popover */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/popover/popover.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/popover/popover.html.js',

                        /* progressbar */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/progressbar/progressbar.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/bar.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/progress.html.js',

                        /* rating */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/rating/rating.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/rating/rating.html.js',

                        /* tabs */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tabs/tabs.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tab.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tabset.html.js',

                        /* timepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/timepicker/timepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/timepicker/timepicker.html.js',

                        /* tooltip */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tooltip/tooltip.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-html-unsafe-popup.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-popup.html.js',

                        /* typeahead */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/typeahead/typeahead.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-match.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-popup.html.js',

                        // ui-utils

                        '<%= bbc %>/vendor/angular-ui-utils/event/event.js',
                        '<%= bbc %>/vendor/angular-ui-utils/format/format.js',
                        '<%= bbc %>/vendor/angular-ui-utils/highlight/highlight.js',
                        '<%= bbc %>/vendor/angular-ui-utils/if/if.js',
                        '<%= bbc %>/vendor/angular-ui-utils/indeterminate/indeterminate.js',
                        '<%= bbc %>/vendor/angular-ui-utils/inflector/inflector.js',
                        '<%= bbc %>/vendor/angular-ui-utils/jq/jq.js',
                        '<%= bbc %>/vendor/angular-ui-utils/keypress/keypress.js',
                        '<%= bbc %>/vendor/angular-ui-utils/mask/mask.js',
                        '<%= bbc %>/vendor/angular-ui-utils/reset/reset.js',
                        '<%= bbc %>/vendor/angular-ui-utils/route/route.js',
                        '<%= bbc %>/vendor/angular-ui-utils/scrollfix/scrollfix.js',
                        '<%= bbc %>/vendor/angular-ui-utils/showhide/showhide.js',
                        '<%= bbc %>/vendor/angular-ui-utils/unique/unique.js',
                        '<%= bbc %>/vendor/angular-ui-utils/validate/validate.js',

                        // baboon.services
                        '<%= bbc %>/lib/services/baboon-core.js',
                        '<%= bbc %>/lib/services/lx-form.js',
                        '<%= bbc %>/lib/services/lx-inline-edit.js',

                        // baboon.directives
                        '<%= bbc %>/lib/directives/lx-file-upload.js',
                        '<%= bbc %>/lib/directives/lx-float.js',
                        '<%= bbc %>/lib/directives/lx-integer.js',
                        '<%= bbc %>/lib/directives/lx-pager.js',
                        '<%= bbc %>/lib/directives/lx-sort.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/app/ui_examples/**/*.js',
                        '!client/app/ui_examples/**/*.spec.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/public/css/ui_app.css': [

                        // toplevel css
                        'client/app/ui_examples/**/*.css'
                    ]
                }
            },

            /**
             * The `admin` target is for toplevel application js and css libraries.
             */
            admin: {
                files: {
                    'build/dist/public/js/admin_app.js': [

                        // prefix
                        'client/module.prefix',

                        // ui-bootstrap

                        /* required */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/transition/transition.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/position/position.js',

                        /* optional */

                        /* accordion */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/accordion/accordion.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/accordion/accordion-group.html.js',

                        /* alert */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/alert/alert.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/alert/alert.html.js',

                        /* buttons */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/buttons/buttons.js',

                        /* carousel */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/carousel/carousel.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/carousel.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/carousel/slide.html.js',

                        /* collapse */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/collapse/collapse.js',

                        /* datepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/datepicker/datepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/datepicker/datepicker.html.js',

                        /* dialog */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dialog/dialog.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/dialog/message.html.js',

                        /* dropdownToggle */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/dropdownToggle/dropdownToggle.js',

                        /* modal */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/modal/modal.js',

                        /* pagination */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/pagination/pagination.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pager.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/pagination/pagination.html.js',

                        /* popover */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/popover/popover.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/popover/popover.html.js',

                        /* progressbar */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/progressbar/progressbar.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/bar.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/progressbar/progress.html.js',

                        /* rating */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/rating/rating.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/rating/rating.html.js',

                        /* tabs */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tabs/tabs.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tab.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tabs/tabset.html.js',

                        /* timepicker */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/timepicker/timepicker.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/timepicker/timepicker.html.js',

                        /* tooltip */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/tooltip/tooltip.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-html-unsafe-popup.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/tooltip/tooltip-popup.html.js',

                        /* typeahead */
                        '<%= bbc %>/vendor/angular-ui-bootstrap/src/typeahead/typeahead.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-match.html.js',
                        '<%= bbc %>/vendor/angular-ui-bootstrap/template/typeahead/typeahead-popup.html.js',

                        // ui-utils

                        '<%= bbc %>/vendor/angular-ui-utils/event/event.js',
                        '<%= bbc %>/vendor/angular-ui-utils/format/format.js',
                        '<%= bbc %>/vendor/angular-ui-utils/highlight/highlight.js',
                        '<%= bbc %>/vendor/angular-ui-utils/if/if.js',
                        '<%= bbc %>/vendor/angular-ui-utils/indeterminate/indeterminate.js',
                        '<%= bbc %>/vendor/angular-ui-utils/inflector/inflector.js',
                        '<%= bbc %>/vendor/angular-ui-utils/jq/jq.js',
                        '<%= bbc %>/vendor/angular-ui-utils/keypress/keypress.js',
                        '<%= bbc %>/vendor/angular-ui-utils/mask/mask.js',
                        '<%= bbc %>/vendor/angular-ui-utils/reset/reset.js',
                        '<%= bbc %>/vendor/angular-ui-utils/route/route.js',
                        '<%= bbc %>/vendor/angular-ui-utils/scrollfix/scrollfix.js',
                        '<%= bbc %>/vendor/angular-ui-utils/showhide/showhide.js',
                        '<%= bbc %>/vendor/angular-ui-utils/unique/unique.js',
                        '<%= bbc %>/vendor/angular-ui-utils/validate/validate.js',

                        // baboon.services
                        '<%= bbc %>/lib/services/baboon-core.js',
                        '<%= bbc %>/lib/services/lx-form.js',
                        '<%= bbc %>/lib/services/lx-inline-edit.js',

                        // baboon.directives
                        '<%= bbc %>/lib/directives/lx-file-upload.js',
                        '<%= bbc %>/lib/directives/lx-float.js',
                        '<%= bbc %>/lib/directives/lx-integer.js',
                        '<%= bbc %>/lib/directives/lx-pager.js',
                        '<%= bbc %>/lib/directives/lx-sort.js',

                        // translate
                        '<%= bbc %>/vendor/angular-translate/angular-translate.js',
                        '<%= bbc %>/vendor/angular-translate/angular-translate-loader-static-files.js',

                        // common
                        'client/common/**/*.js',
                        '!client/common/**/*.spec.js',

                        // toplevel app
                        'client/app/admin/**/*.js',
                        '!client/app/admin/**/*.spec.js',

                        // suffix
                        'client/module.suffix'
                    ],
                    'build/dist/public/css/admin_app.css': [

                        // toplevel css
                        'client/app/admin/**/*.css'
                    ]
                }
            }
        },

        /**
         * prepare uglify with ngmin only for angular stuff
         */

        ngmin: {
            app: {
                src: ['build/dist/public/js/app.js'],
                dest: 'build/tmp/app.js'
            },
            ui: {
                src: ['build/dist/public/js/ui_app.js'],
                dest: 'build/tmp/ui_app.js'
            }
        },

        /**
         * minification js files
         */

        uglify: {
            target: {
                files: {
                    'build/dist/public/js/app.min.js': 'build/tmp/app.js',
                    'build/dist/public/js/ui_app.min.js': 'build/tmp/ui_app.js'
                }
            }
        },

        /**
         * minification css files
         */

        cssmin: {
            target: {
                files: {
                    'build/dist/public/css/app.min.css': ['build/dist/public/css/app.css'],
                    'build/dist/public/css/ui_app.min.css': ['build/dist/public/css/ui_app.css']
                }
            }
        },

        bgShell: {
            e2e: {
                cmd: 'node test/fixtures/resetDB.js e2e'
            },
            setup: {
                cmd: 'node scripts/setup.js'
            },
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/reports/coverage/server node_modules/grunt-jasmine-node/node_modules/jasmine-node/bin/jasmine-node -- test --forceexit'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/reports/coverage/server --dir build/reports/coverage/server cobertura'
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

        // Configuration to be run (and then tested)
        watch: {
            options: {
                livereload: 35729
            },
            client: {
                files: ['client/**/*.*', 'client/*.*', '!client/**/*.spec.js'],
                tasks: ['build:watch']
            },
            server: {
                files: ['server/modules/**/*.*'],
                tasks: ['express:dev']
            }
        },

        open: {
            browser: {
                url: '<%= conf.protocol %>://<%= conf.host %>:<%= conf.port %>'
            },
            coverageServer: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/server/lcov-report/'))
            },
            coverageClient: {
                path: path.join(__dirname, getCoverageReport('build/reports/coverage/client/'))
            }
        },

        replace: {
            debug: {
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            release: {
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: '.min'},
                    {from: '<!--@@livereload-->', to: ''}
                ]
            },
            livereload: {
                src: ['build/dist/views/*.html'],
                overwrite: true,
                replacements: [
                    {from: '<!--@@min-->', to: ''},
                    {from: '<!--@@livereload-->', to: '<script src="<%= conf.protocol %>://<%= conf.host %>:' +
                        '<%=watch.options.livereload%>/livereload.js?snipver=1"></script>'}
                ]
            }
        },

        karma: {
            unit: {
                configFile: 'config/karma.conf.js'
            },
            ci: {
                configFile: 'config/karma.conf.js',
                reporters: ['progress', 'junit'],
                junitReporter: {
                    outputFile: 'build/reports/tests/karma.xml',
                    suite: 'karma'
                }
            },
            debug: {
                configFile: 'config/karma.conf.js',
                detectBrowsers: false,
                singleRun: false
            },
            coverage: {
                configFile: 'config/karma.coverage.conf.js'
            },
            cobertura: {
                configFile: 'config/karma.coverage.conf.js',
                coverageReporter: {
                    type: 'cobertura',
                    dir: 'build/reports/coverage/client'
                }
            },
            e2e: {
                configFile: 'config/karma.e2e.conf.js'
            },
            e2e_chrome: {
                configFile: 'config/karma.e2e.conf.js'
            },
            e2e_chrome_canary: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['ChromeCanary'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/chrome_canary.xml',
                    suite: 'ChromeCanary'
                }
            },
            e2e_firefox: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['Firefox'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/firefox.xml',
                    suite: 'Firefox'
                }
            },
            e2e_safari: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['Safari'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/safari.xml',
                    suite: 'Safari'
                }
            },
            e2e_ie: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['IE'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/ie.xml',
                    suite: 'IE'
                }
            },
            e2e_phantom: {
                configFile: 'config/karma.e2e.conf.js',
                browsers: ['PhantomJS'],
                junitReporter: {
                    outputFile: 'build/reports/jasmine/phantomJS.xml',
                    suite: 'PhantomJS'
                }
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
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ngmin');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-markdown');

    // Tasks
    grunt.registerTask('setup', [
        'bgShell:setup'
    ]);
    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:debug'
    ]);
    grunt.registerTask('build:watch', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'setup',
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
        'jshint:test'
    ]);
    grunt.registerTask('unit', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit'
    ]);
    grunt.registerTask('debug', [
        'karma:debug'
    ]);
    grunt.registerTask('unitClient', [
        'jshint:test',
        'karma:unit'
    ]);
    grunt.registerTask('coverClient', [
        'clean:coverageClient',
        'jshint:test',
        'karma:coverage',
        'open:coverageClient'
    ]);
    grunt.registerTask('unitServer', [
        'clean:jasmine',
        'jshint:test',
        'jasmine_node'
    ]);
    grunt.registerTask('coverServer', [
        'clean:coverageServer',
        'jshint:test',
        'bgShell:coverage',
        'open:coverageServer'
    ]);
    grunt.registerTask('cover', [
        'clean:coverageServer',
        'clean:coverageClient',
        'jshint:test',
        'bgShell:coverage',
        'karma:coverage'
    ]);
    grunt.registerTask('e2e', [
        'jshint:test',
        'bgShell:e2e',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('e2e:all', [
        'jshint:test',
        'bgShell:e2e',
        'build',
        'express:e2e',
        'karma:e2e_chrome',
        'bgShell:e2e',
        'karma:e2e_firefox',
        'bgShell:e2e',
        'karma:e2e_chrome_canary',
        'bgShell:e2e',
        'karma:e2e_phantom',
        'bgShell:e2e',
        'karma:e2e_safari',
        'bgShell:e2e',
        'karma:e2e_ie'
    ]);
    grunt.registerTask('e2e:release', [
        'jshint:test',
        'bgShell:e2e',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test', [
        'bgShell:e2e',
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit',
        'build',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('test:release', [
        'bgShell:e2e',
        'clean:jasmine',
        'jshint:test',
        'jasmine_node',
        'karma:unit',
        'release',
        'express:e2e',
        'karma:e2e'
    ]);
    grunt.registerTask('server', [
        'clean:dist',
        'copy',
        'html2js',
        'concat',
        'replace:livereload',
        'setup',
        'express:dev',
        'open:browser',
        'watch'
    ]);
    grunt.registerTask('ci', [
        'clean',
        'build',
        'jshint:jslint',
        'jshint:checkstyle',
        'bgShell:coverage',
        'bgShell:cobertura',
        'jasmine_node',
        'karma:unit',
        'karma:coverage',
        'karma:cobertura'
    ]);

    // Default task.
    grunt.registerTask('default', ['build']);
};