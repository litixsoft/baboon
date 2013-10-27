baboon = {

    /**
     * Builds the templates from baboon.common and client.common.
     * The Baboon build expanded this configuration with the templates from baboon-client.
     * In addition, baboon-build expanded this configuration with the application templates.
     * Baboon-build uses the prefixes bb_ *.
     */
    html2js: {
    },

    /**
     * The concat configuration overwrite dynamically by baboon-build with the prefixes bb_ *.
     * Currently you can only adjust the base here. Extending concat is not yet possible.
     */
    concat: {
        /**
         * The basis for all applications will be inserted into any application.
         * The dest is generated dynamically from baboon build.
         * Here is regulated, what all should be included in the application.
         */
        base: {
            options: {
                banner: '<%= banner %>\n<%= module_prefix %>',
                    footer: '<%= module_suffix %>'
            },
            src: [
                '<%= clientVendorFolder %>/angular-ui-utils/modules/*.js',
                '<%= clientVendorFolder %>/angular-ui-utils/modules/**/*.js',
                '!<%= clientVendorFolder %>/angular-ui-utils/modules/**/*Spec.js',
                '<%= clientVendorFolder %>/angular-translate/angular-translate.js',
                '<%= clientVendorFolder %>/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
            ]
        }
    },

    /**
     * The includes for all applications. The optional includes from app.conf.json are added by baboon-build.
     * This Includes Angular needed for injection. Use here the correct module name.
     */
    includes: [
        'ui.utils',
        'pascalprecht.translate',
        'lib.common.templates',
        'common.templates',
        'lib.optional.templates',
        'optional.templates',
        'app.templates',
        'lx.alert',
        'lx.auth',
        'lx.float',
        'lx.integer',
        'lx.modal',
        'lx.nav',
        'lx.session',
        'lx.socket',
        'ui.if'
    ],

    /**
     * Less configuration skeleton. Baboon-build to insert the application less files.
     * You can simply insert your configurations here.
     */
        less: {
        debug: {
            files: {}
        },
        release: {
            options: {
                yuicompress: true
            },
            files: {}
        }
    },

    /**
     * ngmin configuration skeleton. Baboon-build is to insert all the javascript files of the application.
     * You can simply insert your configurations here.
     */
    ngmin: {},

    /**
     * uglify configuration skeleton. Baboon-build is to insert all the javascript files of the application.
     * You can simply insert your configurations here.
     */
    uglify: {
        target: {
            files: {}
        }
    }
};

// buildHelper
var buildHelper = require('./buildHelper')('../example', baboon);
