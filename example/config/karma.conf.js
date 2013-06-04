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

reporters = ['progress'];

browsers = ['Chrome'];

singleRun = true;