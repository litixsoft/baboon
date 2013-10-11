/*global angular*/
angular.module('blog.admin', ['blog.services', 'blog.admin.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/blog/admin', {templateUrl: 'blog/admin/admin.html'});
        $routeProvider.when('/blog/admin/post/new', {templateUrl: 'blog/admin/editPost.html', controller: 'blogAdminEditPostCtrl'});
        $routeProvider.when('/blog/admin/post/edit/:id', {templateUrl: 'blog/admin/editPost.html', controller: 'blogAdminEditPostCtrl'});
    })
    .controller('blogAdminAdminCtrl', ['$scope', 'blogPosts', 'blogAdminAuthorPosts', 'lxInlineEdit','$modal', function ($scope, blogPosts, blogAdminAuthorPosts, lxInlineEdit, $modal) {
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

                blogPosts.getAllWithCount(query, callback);
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
        $scope.inlineEdit = lxInlineEdit();

        $scope.save = function (post, form) {
            $scope.myForm = form;
            form.errors = {};

            if (post._id) {
                blogAdminAuthorPosts.update(post, saveCallback);
            }
        };

        $scope.addPosts = function () {
            var data = {};

            for (var i = 0; i < 1000; i++) {
                data = {
                    title: 'Post ' + i,
                    content: 'Content ' + i
                };

                blogAdminAuthorPosts.create(data, function () {});
            }
        };

        $scope.openTags = function () {
            $scope.instance = $modal.open({
                backdrop: true, //static, true, false
                modalFade: true,
                controller: 'blogAdminModalCtrl',
                keyboard: false,
                resolve: {},
                templateUrl: 'blog/admin/blogAdminTagsCtrl/myModalContent.html'
            });
        };

        $scope.getData({skip: 0, limit: 5});
    }])
    .controller('blogAdminEditPostCtrl', ['$scope', '$routeParams', 'blogAdminAuthorPosts', 'appBlogAdminTags', 'lxForm', '$location', function ($scope, $routeParams, blogAdminAuthorPosts, tags, lxForm) {
        $scope.lxForm = lxForm('blog_post', '_id');

        if (!$scope.lxForm.hasLoadedModelFromCache($routeParams.id)) {
            blogAdminAuthorPosts.getById($routeParams.id, function (result) {
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
                blogAdminAuthorPosts.update(model, callback);
            } else {
                blogAdminAuthorPosts.create(model, callback);
            }
        };

        tags.getAll({}, function (result) {
            if (result.data) {
                $scope.tags = result.data;
            }
        });
    }])
    .controller('blogAdminModalCtrl', ['$scope','$modalInstance','appBlogAdminTags', function ($scope, $modalInstance, tags) {

        $scope.modal = {};

        $scope.modal.validationErrors = [];

        tags.getAll({}, function (result) {
            if (result.data) {
                $scope.modal.items = result.data;
            }
        });

        $scope.modal.save = function (name) {
            tags.createTag({name: name}, function (result) {
                $scope.modal.validationErrors = [];
                if (result.data) {
                    $scope.modal.items.push(result.data);
                    $scope.modal.name = '';
//                    $scope.modal.validationErrors = [];
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
            if ($modalInstance) {
                $modalInstance.dismiss('cancel');
            }
        };

        $scope.modal.closeAlert = function (index) {
            $scope.modal.validationErrors.splice(index, 1);
        };
    }]);
