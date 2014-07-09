// An example configuration file.
'use strict';

exports.config = {

    // The address of a running selenium server.
//  seleniumAddress: 'http://127.0.0.1:3003/',

    // Capabilities to be passed to the webdriver instance.
    capabilities: {
        'browserName': 'chrome'
    },

    // Spec patterns are relative to the current working directly when
    // protractor is called.
    specs: ['../e2e/*.spec.js'],

    baseUrl: 'http://localhost:9001',

    // Options to be passed to Jasmine-node.
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000
    }
};
