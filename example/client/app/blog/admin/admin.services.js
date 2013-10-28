/*global angular*/
angular.module('blog.admin.services', [])
    .factory('appBlogAdminTags', ['lxTransport', 'blog.modulePath', function (transport, modulePath) {
        var pub = {},
            tags = [];

        pub.refresh = true;

        pub.getAll = function (query, callback) {
            if (pub.refresh) {
                transport.emit(modulePath + 'blog/getAllTags', query, function (error, result) {
                    if (result) {
                        tags = result;
                        pub.refresh = false;
                    }

                    callback(error, result);
                });
            } else {
                callback(null, tags);
            }
        };

        pub.createTag = function (tag, callback) {
            transport.emit(modulePath + 'blog/createTag', tag, callback);
        };

        pub.updateTag = function (tag, callback) {
            transport.emit(modulePath + 'blog/updateTag', tag, callback);
        };

        pub.deleteTag = function (id, callback) {
            transport.emit(modulePath + 'blog/deleteTag', {id: id}, callback);
        };

        return pub;
    }]);