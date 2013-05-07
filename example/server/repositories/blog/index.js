'use strict';

module.exports = function(blogConnection) {
    return require('./blogRepository')(blogConnection);
};