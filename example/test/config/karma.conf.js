basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,

    'client/components/angular/angular.js',
    'client/components/angular-mocks/angular-mocks.js',
    'dist/app.js',
    'test/unit/**/*.js'
];

preprocessors = {
    'dist/app.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type : 'html',
    dir : 'build/reports/coverage'
};

browsers = ['Chrome'];

singleRun = true;
