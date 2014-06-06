'use strict';

angular.module('demo.enterprise', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/demo/enterprise', { templateUrl: 'app/demo/enterprise/enterprise.html', controller: 'DemoEnterpriseCtrl' });
        $routeProvider.when('/demo/enterprise/new', { templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseEditCtrl' });
        $routeProvider.when('/demo/enterprise/edit/:id', { templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseEditCtrl' });
    })
    .constant('enterpriseModulePath', 'api/app/demo/enterprise/')
    .controller('DemoEnterpriseCtrl', function ($scope, $bbcTransport, enterpriseModulePath, $log, $bbcAlert, $bbcModal) {
        $scope.bbcAlert = $bbcAlert;
        $scope.crew = [];
        var options = { id: 'uniqueId', headline: 'Delete', message: 'Do you want to delete this entry?', backdrop: false, buttonTextValues: { yes: 'Yes', no: 'No' } };

        // getAll members from service
        var getAllMembers = function () {
            $bbcTransport.emit(enterpriseModulePath + 'enterprise/getAllMembers', {}, function (error, result) {
                if (error) {
                    $log.error(error);
                    return;
                }

                $scope.crew = result;
            });
        };

        // init get all members and register watch for crew
        getAllMembers();

        $scope.createTestMembers = function (reset) {
            reset = reset || null;
            if ($scope.crew.length === 0) {
                $bbcTransport.emit(enterpriseModulePath + 'enterprise/createTestMembers', {}, function (error, result) {
                    if (error) {
                        getAllMembers();
                    }
                    else if (result) {
                        $scope.crew = result;
                        $scope.bbcAlert.success(reset ? 'db reset.' : 'crew created.');
                    }
                });
            }
            else {
                $scope.bbcAlert.danger('can\'t create test crew, already exists.');
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
                $scope.bbcAlert.danger('can\'t reset db, find no data.');
            }
        };

        $scope.deleteMember = function (id, name) {
            options.callObj = {
                cbYes: function () {
                    $bbcTransport.emit(enterpriseModulePath + 'enterprise/deleteMember', {id: id}, function (error, result) {
                        if (result) {
                            $scope.bbcAlert.success('crew member ' + name + ' deleted.');
                            getAllMembers();
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