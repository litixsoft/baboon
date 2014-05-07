'use strict';

angular.module('demo.enterprise', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/demo/enterprise', {templateUrl: 'app/demo/enterprise/enterprise.html', controller: 'DemoEnterpriseCtrl'});
        $routeProvider.when('/demo/enterprise/new', {templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseNewCtrl'});
        $routeProvider.when('/demo/enterprise/edit/:id', {templateUrl: 'app/demo/enterprise/edit.html', controller: 'DemoEnterpriseEditCtrl'});
    })
    .constant('enterpriseModulePath', 'api/app/demo/enterprise/')
    .controller('DemoEnterpriseCtrl', function ($scope, $bbcTransport, enterpriseModulePath, $log, $bbcAlert, $bbcModal) {


        $scope.title = 'Enterprise';
        $scope.bbcAlert = $bbcAlert;

        $scope.message = '';

        var buttonTextValues = { yes: 'Yes', no: 'No', close: 'Close', ok: 'Ok' };
        var options = { id: 'uniqueId', headline: 'Title bar', message: 'The message text.',
            backdrop: false, buttonTextValues: buttonTextValues };

        $scope.headline = 'Überschrift';
        $scope.message = 'Hallo Herr/Frau User(in), was soll ich nun machen?';
        $scope.type = 'Error';
        $scope.crew = [];

        // watch the crew and show or hide
        $scope.$watch('crew', function (value) {
            if (value && value.length === 0) {
                $scope.visible.reset = false;
                $scope.visible.create = true;
            }
            else {
                $scope.visible.reset = true;
                $scope.visible.create = false;
            }
        });

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

        // visible vars for controller
        $scope.visible = {
            reset: false,
            create: false
        };

        // init get all members and register watch for crew
        getAllMembers();

        // create test members for crew collection
        $scope.createTestMembers = function (reset) {
            reset = reset || null;
            if ($scope.crew.length === 0) {
                $bbcTransport.emit(enterpriseModulePath + 'enterprise/createTestMembers', {}, function (error, result) {
                    if (error) {
//                        lxAlert.error(error);
                        getAllMembers();
                    }
                    else if (result) {
                        $scope.crew = result;

                        if (reset) {
                            $scope.bbcAlert.success('db reset.');
                        } else {
                            $scope.bbcAlert.success('crew created.');
                        }
                    }
                });
            }
            else {
                $scope.bbcAlert.danger('can\'t create test crew, already exists.');
            }
        };

        // delete crew collection and create test members
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

        // delete crew member by id
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
    });



//    .controller('enterpriseEditCtrl', ['$scope', '$location', '$routeParams', 'lxTransport', 'lxForm', 'enterprise.modulePath',
//        function ($scope, $location, $routeParams, transport, lxForm, modulePath) {
//            $scope.lxForm = lxForm('enterpriseEdit', '_id');
//
//            transport.emit(modulePath + 'enterprise/getMemberById', {id: $routeParams.id}, function (error, result) {
//                $scope.person = result;
//            });
//
//            $scope.save = function () {
//                transport.emit(modulePath + 'enterprise/updateMember', $scope.person, function (error, result) {
//                    if (result) {
//                        $location.path('/enterprise');
//                    }
//                    else if (error) {
//                        if (error.validation) {
//                            $scope.lxForm.populateValidation($scope.form, error.validation);
//                        } else {
//                            $scope.lxAlert.error(error);
//                        }
//                    }
//                });
//            };
//        }])
//    .controller('enterpriseNewCtrl', ['$scope', '$location', 'lxTransport', 'lxForm', 'enterprise.modulePath',
//        function ($scope, $location, transport, lxForm, modulePath) {
//            $scope.lxForm = lxForm('enterpriseNew', '_id');
//
//            // empty person
//            $scope.person = {name: '', description: ''};
//
//            $scope.save = function () {
//                transport.emit(modulePath + 'enterprise/createMember', $scope.person, function (error, result) {
//                    if (result) {
//                        $location.path('/enterprise');
//                    }
//                    else if (error) {
//                        if (error.validation) {
//                            $scope.lxForm.populateValidation($scope.form, error.validation);
//                        } else {
//                            $scope.lxAlert.error(error);
//                        }
//                    }
//                });
//            };
//        }]);