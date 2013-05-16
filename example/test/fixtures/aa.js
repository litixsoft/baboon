'use strict';

var path = require('path'),
    rootPath = path.resolve('..', '..', 'baboon/example'),
    baboon = require('../../../lib/baboon')(rootPath),
    blogRepo = require('../../server/repositories/blog')(baboon.config.mongo.blog);

blogRepo.posts.delete({}, function () {
    console.log('Deleted posts collection in db: ' + baboon.config.mongo.blog);
});
baboon.server.start();
