/*global angular*/
angular.module('blog.admin', ['blog.services', 'admin.services', 'blog.directives'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog/admin', {templateUrl: '/blog/admin/admin.html'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: '/blog/admin/editPost.html', controller: 'editPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: '/blog/admin/editPost.html', controller: 'editPostCtrl'});
    })
    .controller('adminCtrl', ['$scope', 'posts', 'authorPosts', 'inlineEdit', function ($scope, posts, authorPosts, inlineEdit) {
        var options = {},
            callback = function (result) {
                if (result.data) {
                    $scope.posts = result.data;
                    $scope.count = result.count;
                } else {
                    console.log(result);
                }
            },
            saveCallback = function (result) {
                if (result.data || result.success) {
                    $scope.inlineEdit.model = null;
                } else {
                    if (result.errors) {
//                        $scope.lxForm.populateValidation($scope.form, result.errors);
                        $scope.inlineEdit.populateValidation($scope.myForm, result.errors);
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            },
            getData = function () {
                var query = {
                    params: {},
                    options: options || {}
                };

                posts.getAllWithCount(query, callback);
            };

        $scope.sort = function (field) {
            options.sort = options.sort || {};
            var oldDirection = options.sort[field] || -1;

            // set sort
            options.sort = {};
            options.sort[field] = oldDirection > 0 ? -1 : 1;

            // go to first page
            if ($scope.currentPage > 1) {
                options.skip = 0;
                $scope.currentPage = 1;
            } else {
                $scope.getData();
            }
        };

        $scope.getData = function (pagingOptions) {
            if (pagingOptions) {
                options.skip = pagingOptions.skip;
                options.limit = pagingOptions.limit;
            }

            getData();
        };

        ///////////////////////////////////////
        $scope.inlineEdit = inlineEdit();

        $scope.save = function (post, form) {
            $scope.myForm = form;
            form.errors = {};

            if (post._id) {
                authorPosts.update(post, saveCallback);
            }
        };

        $scope.addPosts = function () {
            var data = {};

            for (var i = 0; i < 1000; i++) {
                data = {
                    title: 'Post ' + i,
                    content: 'Content ' + i
                };

                authorPosts.create(data, function () {});
            }
        };

        $scope.getData({skip: 0, limit: 5});
    }])
    .controller('editPostCtrl', ['$scope', '$routeParams', 'authorPosts', 'tags', 'lxForm', '$location', function ($scope, $routeParams, authorPosts, tags, lxForm) {
        $scope.lxForm = lxForm('blog_post', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            authorPosts.getById($routeParams.id, function (result) {
                if (result.data) {
                    $scope.lxForm.setModel(result.data);
                } else {
                    console.log(result.message);
                }
            });
        }

        $scope.save = function (model) {
            if ($scope.form) {
                $scope.form.errors = {};
            }

            var callback = function (result) {
                if (result.data || result.success) {
                    $scope.lxForm.setModel(result.data || model, true);
                    tags.refresh = true;
                } else {
                    if (result.errors) {
                        $scope.lxForm.populateValidation($scope.form, result.errors);
                    }

                    if (result.message) {
                        console.log(result.message);
                    }
                }
            };

            if (model._id) {
                authorPosts.update(model, callback);
            } else {
                authorPosts.create(model, callback);
            }
        };

        tags.getAll({}, function (result) {
            if (result.data) {
                $scope.tags = result.data;
            }
        });
    }])
    .controller('tagsCtrl', ['$scope', 'tags', function ($scope, tags) {
        $scope.modal = {
            opts: {
                backdropFade: true,
                dialogFade: true
            },
            validationErrors: []
        };

        $scope.modal.closeAlert = function (index) {
            $scope.modal.validationErrors.splice(index, 1);
        };

        $scope.modal.open = function () {
            $scope.modal.shouldBeOpen = true;
            $scope.modal.validationErrors = [];

            tags.getAll({}, function (result) {
                if (result.data) {
                    $scope.modal.items = result.data;
                }
            });
        };

        $scope.modal.save = function (name) {
            tags.createTag({name: name}, function (result) {
                if (result.data) {
                    $scope.modal.items.push(result.data);
                    $scope.modal.name = '';
                    $scope.modal.validationErrors = [];
                }

                if (result.errors) {
                    for (var i = 0; i < result.errors.length; i++) {
                        $scope.modal.validationErrors.push({
                            type: 'error',
                            msg: result.errors[i].property + ' ' + result.errors[i].message
                        });
                    }
                }

                if (result.message) {
                    $scope.modal.validationErrors.push({type: 'error', msg: result.message});
                }
            });
        };

        $scope.modal.delete = function (tag) {
            tags.deleteTag(tag._id, function (result) {
                if (result.success) {
                    var index = $scope.modal.items.indexOf(tag);
                    $scope.modal.items.splice(index, 1);
                }

                if (result.message) {
                    $scope.modal.validationErrors.push({type: 'error', msg: result.message});
                }
            });
        };

        $scope.modal.close = function () {
            $scope.modal.shouldBeOpen = false;
        };
    }]);
