basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'node_modules/baboon-client/vendor/angular/angular.js',
    'node_modules/baboon-client/vendor/angular/angular-mocks.js',
    'node_modules/baboon-client/lib/**/*.js',
    'test/fixtures/mocks.js',
    'client/public/vendor/showdown/showdown.js',
    'client/app/**/*.js'
];

preprocessors = {
    'client/app/**/*.js': 'coverage'
};

reporters = ['progress', 'coverage'];

coverageReporter = {
    type : 'cobertura',
    dir : 'build/reports/coverage/client'
};

browsers = ['Chrome'];

singleRun = true;