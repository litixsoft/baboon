'use strict';

angular.module('demo.enterprise', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/demo/enterprise', { templateUrl: 'app/demo/enterprise/enterprise.html', controller: 'DemoEnterpriseCtrl' });
        $routeProvider.when('/demo/enterprise/new', { templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseEditCtrl' });
        $routeProvider.when('/demo/enterprise/edit/:id', { templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseEditCtrl' });
    })
    .constant('enterpriseModulePath', 'api/app/demo/enterprise/')
    .controller('DemoEnterpriseCtrl', function ($rootScope, $scope, $bbcTransport, enterpriseModulePath, $log, $bbcAlert, $bbcModal, $translate) {
        $scope.bbcAlert = $bbcAlert;
        $scope.crew = [];
        var options = { id: 'uniqueId', headline: 'DEL', message: 'MSG', backdrop: false, buttonTextValues: { yes: 'Y', no: 'N' } };

        $rootScope.$on('$translateChangeSuccess', function () {
            $translate(['DELETE', 'DELETE_MSG', 'YES', 'NO']).then(function (v) {
                options.headline = v.DELETE;
                options.message = v.DELETE_MSG;
                options.buttonTextValues.yes = v.YES;
                options.buttonTextValues.no = v.NO;
            });
        });

        $rootScope.$broadcast('$translateChangeSuccess');

        var getData = function () {
            $bbcTransport.emit(enterpriseModulePath + 'enterprise/getAllMembers', {}, function (error, result) {
                if (error) {
                    $log.error(error);
                    return;
                }

                $scope.crew = result;
            });
        };

        $scope.createTestMembers = function (reset) {
            reset = reset || null;
            if ($scope.crew.length === 0) {
                $bbcTransport.emit(enterpriseModulePath + 'enterprise/createTestMembers', {}, function (error, result) {
                    if (error) {
                        getData();
                    }
                    else if (result) {
                        $scope.crew = result;
                        $scope.bbcAlert.success(reset ? 'Database reseted.' : 'Crew created.');
                    }
                });
            }
            else {
                $scope.bbcAlert.danger('Can not create test crew, already exists.');
            }
        };

        $scope.resetDb = function () {
            if (!$scope.crew || $scope.crew.length > 0) {
                $bbcTransport.emit(enterpriseModulePath + 'enterprise/deleteAllMembers', {}, function (error, result) {
                    if (error) {
                        $scope.bbcAlert.danger(error);
                    }
                    else if (result) {
                        $scope.crew = [];
                        $scope.createTestMembers(true);
                    }
                });
            }
            else {
                $scope.bbcAlert.danger('Can not reset db, no data found.');
            }
        };

        $scope.delete = function (id) {
            options.callObj = {
                cbYes: function () {
                    $bbcTransport.emit(enterpriseModulePath + 'enterprise/deleteMember', { id: id }, function (error, result) {
                        if (result) {
                            getData();
                        }
                        else if (error) {
                            $scope.bbcAlert.danger(error);
                        }
                    });
                },
                cbNo: function () {}
            };
            $bbcModal.open(options);
        };

        getData();
    })
    .controller('DemoEnterpriseEditCtrl', function ($scope, $location, $routeParams, $bbcTransport, $bbcForm, enterpriseModulePath) {
        $scope.bbcForm = $bbcForm('enterpriseEdit', '_id');

        if ($routeParams.id && !$scope.bbcForm.hasLoadedModelFromCache($routeParams.id)) {
            $bbcTransport.emit(enterpriseModulePath + 'enterprise/getMemberById', { id: $routeParams.id }, function (error, result) {
                $scope.bbcForm.setModel(result);
            });
        }

        $scope.save = function (model) {
            var method = enterpriseModulePath + (model._id ? 'enterprise/updateMember' : 'enterprise/createMember');

            $bbcTransport.emit(method, model, function (error, result) {
                if (result) {
                    $location.path('/enterprise');
                }
                else if (error) {
                    if (error.name === 'ValidationError') {
                        $scope.bbcForm.populateValidation($scope.form, error.errors);
                    }
                }
            });
        };
    });