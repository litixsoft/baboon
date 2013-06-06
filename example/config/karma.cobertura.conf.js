basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'vendor/angular/angular.js',
    'vendor/angular/angular-mocks.js',
    'test/fixtures/mocks.js',
    'client/public/vendor/showdown/showdown.js',
    'client/common/baboon/**/*.js',
    'client/app/**/*.js'
];

preprocessors = {
    'client/app/**/*.js': 'coverage',
    'client/common/baboon/**/*.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type : 'cobertura',
    dir : 'build/reports/coverage/client'
};

browsers = ['Chrome'];

singleRun = true;