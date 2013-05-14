/*global angular */
angular.module('lx.services', [])
    .factory('lxPager', function () {
        return function (model) {
            var pub = {};

            pub.currentPage = 0;
            pub.pageSize = 2;
            pub.count = 0;
            pub.skip = function () {
                return pub.currentPage * pub.pageSize;
            };

            pub.numberOfPages = function () {
                if (pub.pageSize < 1) {
                    pub.pageSize = 1;
                }

                return Math.ceil(pub.count / pub.pageSize);
            };

            pub.getOptions = function () {
                var params = model.params || {};

                return {
                    limit: pub.pageSize,
                    skip: pub.skip(),
                    fields: params.fields,
                    sortBy: params.sortBy,
                    sort: params.sort
                };
            };

            pub.getAll = function () {
                model.service.getAllWithCount({
                    params: (model.params || {}).filter || {},
                    options: pub.getOptions()
                }, function (result) {
                    if (result.count) {
                        pub.count = result.count;
                    }

                    model.callback(result);
                });
            };

            pub.nextPage = function () {
                var currentPage = pub.currentPage;
                var count = ++currentPage * pub.pageSize;

                if (count < pub.count) {
                    pub.currentPage = currentPage;
                    pub.getAll();
                }
            };

            pub.previousPage = function () {
                var currentPage = pub.currentPage;

                if (currentPage !== 0) {
                    pub.currentPage = --currentPage;
                    pub.getAll();
                }
            };

            pub.firstPage = function () {
                pub.currentPage = 0;
                pub.getAll();
            };

            pub.lastPage = function () {
                pub.currentPage = pub.numberOfPages() - 1;
                pub.getAll();
            };

            return pub;
        };
    });