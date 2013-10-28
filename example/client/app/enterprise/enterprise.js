/*global angular*/
angular.module('enterprise', [])
    .config(function ($routeProvider) {
        $routeProvider.when('/enterprise', {templateUrl: 'enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/enterprise/new', {templateUrl: 'enterprise/edit.html', controller: 'enterpriseNewCtrl'});
        $routeProvider.when('/enterprise/edit/:id', {templateUrl: 'enterprise/edit.html', controller: 'enterpriseEditCtrl'});
    })
    .constant('enterprise.modulePath', 'example/enterprise/')
    .controller('enterpriseCtrl', ['$scope', 'lxModal', 'lxTransport', 'enterprise.modulePath', '$log',
        function ($scope, lxModal, transport, modulePath, $log) {

            // alert helper var
            var lxAlert = $scope.lxAlert;

//            // modal helper var
//            var lxModal = $scope.lxModal;
            //

            $scope.headline = 'Üerschrift';
            $scope.message = 'Hallo Herr/Frau User(in), was soll ich nun machen?';
            $scope.type = 'Error';
            $scope.crew = [];

            // getAll members from service
            var getAllMembers = function () {
                transport.emit(modulePath + 'enterprise/getAllMembers', {}, function (error, result) {
                    $scope.crew = result;

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

                    if (error) {
                        $log.error(error);
                    }
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
                    transport.emit(modulePath + 'enterprise/createTestMembers', {}, function (error, result) {
                        if (error) {
                            lxAlert.error(error);
                            getAllMembers();
                        }
                        else if (result) {
                            if (reset) {
                                lxAlert.success('db reset.');
                            } else {
                                lxAlert.success('crew created.');
                            }

                            $scope.crew = result;
                        }
                    });
                }
                else {
                    lxAlert.error('can\'t create test crew, already exists.');
                }
            };

            // delete crew collection and create test members
            $scope.resetDb = function () {
                if (!$scope.crew || $scope.crew.length > 0) {
                    transport.emit(modulePath + 'enterprise/deleteAllMembers', {}, function (error, result) {
                        if (error) {
                            lxAlert.error(error);
                        }
                        else if (result) {
                            $scope.crew = [];
                            $scope.createTestMembers(true);
                        }
                    });
                }
                else {
                    lxAlert.error('can\'t reset db, find no data.');
                }
            };

            // delete crew member by id
            $scope.deleteMember = function (id, name) {
                lxModal.msgBox('enterpriseDeleteMember' + name, false, 'Crew-Member löschen?', 'Wollen Sie ' + name + ' wirklich löschen?', 'Warning', {
                    cbYes: function () {
                        transport.emit(modulePath + 'enterprise/deleteMember', {id: id}, function (error, result) {
                            if (result) {
                                lxAlert.success('crew member ' + name + ' deleted.');
                                getAllMembers();
                            }
                            else if (error) {
                                lxAlert.error(error);
                            }
                        });
                    },
                    cbNo: function () {}
                }, 'standard');

                setTimeout(function () {
                    lxModal.updateMsg('enterpriseDeleteMember' + name, 'Diese neue Meldung wird dir vom Sven präsentiert. Du kannst aber gern trotzdem crew member ' + name + ' löschen!');
                }, 2000);
            };
        }])
    .controller('enterpriseEditCtrl', ['$scope', '$location', '$routeParams', 'lxTransport', 'lxForm', 'enterprise.modulePath',
        function ($scope, $location, $routeParams, transport, lxForm, modulePath) {
            $scope.lxForm = lxForm('enterpriseEdit', '_id');

            transport.emit(modulePath + 'enterprise/getMemberById', {id: $routeParams.id}, function (error, result) {
                $scope.person = result;
            });

            $scope.save = function () {
                transport.emit(modulePath + 'enterprise/updateMember', $scope.person, function (error, result) {
                    if (result) {
                        $location.path('/enterprise');
                    }
                    else if (error) {
                        if (error.validation) {
                            $scope.lxForm.populateValidation($scope.form, error.validation);
                        } else {
                            $scope.lxAlert.error(error);
                        }
                    }
                });
            };
        }])
    .controller('enterpriseNewCtrl', ['$scope', '$location', 'lxTransport', 'lxForm', 'enterprise.modulePath',
        function ($scope, $location, transport, lxForm, modulePath) {
            $scope.lxForm = lxForm('enterpriseNew', '_id');

            // empty person
            $scope.person = {name: '', description: ''};

            $scope.save = function () {
                transport.emit(modulePath + 'enterprise/createMember', $scope.person, function (error, result) {
                    if (result) {
                        $location.path('/enterprise');
                    }
                    else if (error) {
                        if (error.validation) {
                            $scope.lxForm.populateValidation($scope.form, error.validation);
                        } else {
                            $scope.lxAlert.error(error);
                        }
                    }
                });
            };
        }]);