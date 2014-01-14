// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'src/client/bower_components/angular/angular.js',
            'src/client/bower_components/angular-mocks/angular-mocks.js',
            'src/client/bower_components/angular-resource/angular-resource.js',
            'src/client/bower_components/angular-cookies/angular-cookies.js',
            'src/client/bower_components/angular-sanitize/angular-sanitize.js',
            'src/client/bower_components/angular-route/angular-route.js',
            'src/client/scripts/**/*.js',
            'test/client/**/*.js'
        ],

        // list of files / patterns to exclude
        exclude: [],

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress'
        // CLI --reporters progress
        reporters: ['dots', 'coverage'],

        preprocessors: {
            'src/client/**/*.js': 'coverage'
        },

        coverageReporter: {
            type: 'html',
            dir: '.reports/reports/coverage/client'
        },

        // web server port
        port: 8080,

        // enable / disable colors in the output (reporters and logs)
        // CLI --colors --no-colors
        colors: true,

        // level of logging
        // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        // CLI --capture-timeout 5000
        captureTimeout: 20000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: true,

        // report which specs are slower than 500ms
        // CLI --report-slower-than 500
        reportSlowerThan: 500,

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
            'karma-coverage',
            'karma-junit-reporter'
        ]
    });
};
