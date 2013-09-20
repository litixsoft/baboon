/*global angular*/
angular.module('enterprise', ['enterprise.services'])
    .config(function ($routeProvider) {
        $routeProvider.when('/enterprise', {templateUrl: '/enterprise/enterprise.html', controller: 'enterpriseCtrl'});
        $routeProvider.when('/enterprise/new', {templateUrl: '/enterprise/edit.html', controller: 'newCtrl'});
        $routeProvider.when('/enterprise/edit/:id', {templateUrl: '/enterprise/edit.html', controller: 'editCtrl'});
    })
    .constant('enterprise.modulePath', 'example/enterprise/')
    .controller('enterpriseCtrl', ['$scope', 'enterpriseCrew', 'msgBox', 'lxAlert', '$timeout',
        function ($scope, enterpriseCrew, msgBox, lxAlert) {

            // getAll members from service
            var getAllMembers = function () {
                enterpriseCrew.getAll({}, function (result) {
                    $scope.crew = result.data;

                    // watch the crew and show or hide
                    $scope.$watch('crew', function (value) {
                        if (value.length === 0) {
                            $scope.visible.reset = false;
                            $scope.visible.create = true;
                        }
                        else {
                            $scope.visible.reset = true;
                            $scope.visible.create = false;
                        }
                    });
                });
            };

            // bind lxAlert service to $scope //
            $scope.alert = lxAlert;

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

                    enterpriseCrew.createTestMembers(function (result) {
                        if (result.message) {
                            lxAlert.error(result.message);
                            getAllMembers();
                        }
                        else if (result.data) {
                            if (reset) {
                                lxAlert.success('db reset.');
                            }
                            else {
                                lxAlert.success('crew created.');
                            }

                            $scope.crew = result.data;
                        }
                    });
                }
                else {
                    lxAlert.error('can\'t create test crew, already exists.');
                }
            };

            // delete crew collection and create test members
            $scope.resetDb = function () {
                if ($scope.crew.length > 0) {
                    enterpriseCrew.deleteAllMembers(function (result) {
                        if (result.message) {
                            lxAlert.error(result.message);
                        }
                        else if (result.success) {
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
                msgBox.modal.show('', 'Wollen Sie ' + name + ' wirklich löschen?', 'Warning', function () {
                    enterpriseCrew.delete(id, function (result) {
                        if (result.success) {
                            lxAlert.success('crew member ' + name + ' deleted.');
                            getAllMembers();
                        }
                        else if (result.message) {
                            lxAlert.error(result.message);
                        }
                    });
                });
            };
        }])
    .controller('editCtrl', ['$scope', '$location', '$routeParams', 'enterpriseCrew', 'lxAlert',
        function ($scope, $location, $routeParams, enterpriseCrew, lxAlert) {

            // bind lxAlert service to $scope
            $scope.alert = lxAlert;

            // visible vars for controller
            $scope.visible = {
                errors: false
            };

            $scope.validationErrors = {};

            enterpriseCrew.getById($routeParams.id, function (result) {
                $scope.person = result.data;
            });

            $scope.save = function () {
                enterpriseCrew.update($scope.person, function (result) {
                    if (result.success) {
                        $location.path('/enterprise');
                    }
                    else if (result.errors) {
                        lxAlert.warning('Server: validation Errors');
                        $scope.validationErrors = result.errors;
                        $scope.visible.errors = true;
                    }
                    else if (result.message) {
                        lxAlert.error(result.message);
                    }
                });
            };
        }])
    .controller('newCtrl', ['$scope', '$location', 'enterpriseCrew', 'lxAlert',
        function ($scope, $location, enterpriseCrew, lxAlert) {

            // empty person
            $scope.person = {name: '', description: ''};

            // bind lxAlert service to $scope
            $scope.alert = lxAlert;

            // visible vars for controller
            $scope.visible = {
                errors: false
            };

            // validation errors
            $scope.validationErrors = {};

            $scope.save = function () {
                enterpriseCrew.create($scope.person, function (result) {
                    if (result.data) {
                        $location.path('/enterprise');
                    }
                    else if (result.errors) {
                        lxAlert.warning('Server: validation Errors');
                        $scope.validationErrors = result.errors;
                        $scope.visible.errors = true;

                    }
                    else if (result.message) {
                        lxAlert.error(result.message);
                    }
                });
            };
        }]);