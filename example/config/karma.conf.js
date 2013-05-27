basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'vendor/angular/angular.js',
    'vendor/angular/angular-mocks.js',
    'test/fixtures/mocks.js',
    '../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js',
    'client/common/baboon/**/*.js',
    'client/app/**/*.js'
];

reporters = ['progress'];

browsers = ['Chrome'];

singleRun = true;