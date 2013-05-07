var application;

module.exports = function (rootPath) {
    if (!application) {
        application = require('./baboon.js')(rootPath);
    }

    return application;
};