basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,

    'client/components/angular/angular.js',
    //'client/components/angular/angular-*.js',
    'test/vendor/angular/angular-mocks.js',
    'client/app/**/*.js',
    'test/unit/**/*.js'
];

preprocessors = {
    'client/app/**/*.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type : 'html',
    dir : 'build/reports/coverage'
};

browsers = ['Chrome'];

singleRun = true;
