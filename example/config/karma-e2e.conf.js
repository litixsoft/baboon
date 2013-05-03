basePath = '../';

files = [
    ANGULAR_SCENARIO,
    ANGULAR_SCENARIO_ADAPTER,
    'test/e2e/**/*.js'
];

autoWatch = false;

browsers = ['Chrome'];

singleRun = true;

proxies = {
    '/': 'http://localhost:3000/'
};

logLevel = LOG_DEBUG;

urlRoot = '/_karma_/';

junitReporter = {
    outputFile: 'build/reports/e2e.xml',
    suite: 'e2e'
};