module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '../',

        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'lib_client/vendor/angular/angular.js',
            'lib_client/vendor/angular/angular-mocks.js',
            'lib_client/vendor/showdown/src/showdown.js',
            'lib_client/vendor/angular-ui-bootstrap/*.js',
            'lib_client/services/**/*.js',
            'lib_client/directives/**/*.js',
            'lib_client/module/**/*.js'
        ],

        // list of excluded files / patterns
        exclude: [
            'lib_client/vendor/angular-ui-bootstrap/*tpls*.js'
        ],

        preprocessors: {
            'lib_client/services/**/*.js': 'coverage',
            'lib_client/directives/**/*.js': 'coverage',
            'lib_client/module/**/*.js': 'coverage'
        },

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress'
        // CLI --reporters progress
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'build/reports/coverage/client/'
        },

        // web server port
        // CLI --port 9876
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        // CLI --log-level debug
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        // CLI --browsers Chrome,Firefox,Safari
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 5000
        captureTimeout: 20000,

        // Auto run tests on start (when browsers are captured) and exit
        // CLI --single-run --no-single-run
        singleRun: true,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-ie-launcher',
            'karma-safari-launcher',
            'karma-coverage',
            'karma-junit-reporter'
        ]
    });
};