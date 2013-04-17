basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'client/components/angular/angular.js',
    'client/components/angular-mocks/angular-mocks.js',
    'client/app/**/*.js'
];

preprocessors = {
    'client/app/**/*.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type : 'html',
    dir : 'test/reports/coverage'
};

browsers = ['Chrome'];

singleRun = true;
