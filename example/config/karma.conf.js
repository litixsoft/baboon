basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'vendor/angular/angular.js',
    'vendor/angular/angular-mocks.js',
    'test/fixtures/mocks.js',
    '../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js',
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
