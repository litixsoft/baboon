module.exports = function(lxDb, blogConnection) {
    var blogRepo = require('./blogRepository')(lxDb, blogConnection);
//    var blogRepo = require('./blogRepository')(lxDb, blogConnection);

    return blogRepo;
};